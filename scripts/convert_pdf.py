"""
PDF to HTML Converter for Laurel Library (v4)
Fixes: text spacing, aggressive watermark/branding removal, paragraph merging,
       empty list filtering, bold span consolidation, scalability for 1000+ PDFs.

Usage:
    py convert_pdf.py input.pdf -c geography -t "Title" -e "UPSC, SSC"
    py convert_pdf.py folder/ -c geography -e "UPSC, SSC"
"""

import fitz  # PyMuPDF
import os
import sys
import json
import argparse
import re
import hashlib
import time
from pathlib import Path
from PIL import Image
import io
import struct

# --- Configuration ---

WATERMARK_PATTERNS = [
    r'testbook\.com',
    r'testbook',
    r'www\.testbook\.com',
    r'pass\s*pro\s*max',
    r'PASS\s*PRO\s*MAX',
]

WATERMARK_WORDS = {'testbook', 'testbook.com', 'www.testbook.com', 'pass pro max'}

# Colors commonly found in testbook branding (RGB)
BRAND_COLORS = [
    (40, 40, 80),    # dark navy
    (200, 50, 30),   # red
    (230, 170, 50),  # gold/yellow
]

# --- State ---
_seen_img_hashes = {}  # hash -> count for dedup (only filter at 3+)
_page_bg_hashes = set()  # track page background images


def is_watermark_text(text):
    """Check if text is a watermark/branding."""
    t = text.strip().lower()
    if not t:
        return True
    if t in WATERMARK_WORDS:
        return True
    for pat in WATERMARK_PATTERNS:
        if re.search(pat, t, re.IGNORECASE):
            return True
    return False


def clean_cell_text(text):
    """Remove watermark from table cell text."""
    if not text:
        return ''
    for pat in WATERMARK_PATTERNS:
        text = re.sub(pat, '', text, flags=re.IGNORECASE)
    return text.strip()


def fix_spacing(text):
    """
    Fix missing spaces in extracted text.
    ONLY handles clear-cut cases to avoid breaking valid text:
    - CamelCase: "divisionsOf" -> "divisions Of"
    - ALL-CAPS concatenation: "DIVISIONSOFINDIA" -> "DIVISIONS OF INDIA"
    - Letter(paren: "India(" -> "India ("
    """
    if not text:
        return text
    
    # Handle ALL-CAPS concatenated text: "PHYSIOGRAPHICDIVISIONSOFINDIA"
    if re.search(r'[A-Z]{10,}', text):
        # Insert spaces around known uppercase words embedded in long caps sequences
        caps_words = r'(?<=[A-Z])(OF|THE|AND|IN|TO|FOR|FROM|BY|AT|ON)(?=[A-Z])'
        text = re.sub(caps_words, r' \1 ', text)
        text = re.sub(r'\s{2,}', ' ', text)
    
    # Insert space between lowercase followed by uppercase: "divisionsOf" -> "divisions Of"
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    
    # Insert space between letter and opening paren: "India(" -> "India ("
    text = re.sub(r'([a-zA-Z])\(', r'\1 (', text)
    # Insert space between closing paren and letter: ")The" -> ") The"
    text = re.sub(r'\)([A-Za-z])', r') \1', text)
    
    # Collapse multiple spaces
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def is_watermark_image(img_data, img_w, img_h, page_w, page_h, page_num):
    """
    Determine if an image is a watermark/logo/branding/background.
    CONSERVATIVE: only filter images that are clearly not content.
    When in doubt, KEEP the image.
    NOTE: img_w, img_h are RENDERED dimensions in page points (not pixels).
    """
    try:
        # 1. Tiny rendered images (< 40pt in both dimensions = ~0.5 inch)
        if img_w < 40 and img_h < 40:
            return True

        # 2. Full-width thin banners (headers/footers with <30pt height)
        if img_w > page_w * 0.8 and img_h < 30:
            return True

        # 3. Near-full-page images are backgrounds (>90% of page area)
        page_area = page_w * page_h
        img_area = img_w * img_h
        if img_area > page_area * 0.90:
            return True

        # 4. Hash-based deduplication: only filter if seen 3+ times
        img_hash = hashlib.md5(img_data).hexdigest()
        _seen_img_hashes[img_hash] = _seen_img_hashes.get(img_hash, 0) + 1
        if _seen_img_hashes[img_hash] >= 3:
            return True

        # 5. Check image content for truly empty/uniform images
        image = Image.open(io.BytesIO(img_data))
        
        # High transparency = watermark overlay (>70% transparent)
        if image.mode == 'RGBA':
            alpha = image.split()[3]
            pixels = list(alpha.getdata())
            transparent = sum(1 for p in pixels if p < 30)
            if transparent > len(pixels) * 0.7:
                return True
            image = image.convert('RGB')
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # 6. Sample pixels - only filter if >92% same color (truly solid)
        w, h = image.size
        if w > 10 and h > 10:
            step_x = max(1, w // 20)
            step_y = max(1, h // 20)
            samples = []
            for sy in range(0, h, step_y):
                for sx in range(0, w, step_x):
                    samples.append(image.getpixel((sx, sy)))
                    if len(samples) >= 400:
                        break
                if len(samples) >= 400:
                    break

            if samples:
                from collections import Counter
                quantized = [(r // 40, g // 40, b // 40) for r, g, b in samples]
                counter = Counter(quantized)
                most_common_count = counter.most_common(1)[0][1]
                # Only filter if >92% pixels are same color = truly solid/blank
                if most_common_count > len(samples) * 0.92:
                    return True

                # Almost entirely white (>94%) = blank placeholder
                light_pixels = sum(1 for r, g, b in samples if r > 240 and g > 240 and b > 240)
                if light_pixels > len(samples) * 0.94:
                    return True

        return False
    except Exception:
        return False


def is_content_image(img_data, img_w, img_h, page_w, page_h, page_num):
    """
    Positive check: is this likely a content diagram/map/chart?
    Content images tend to have:
    - Moderate size (not tiny, not full-page)
    - Multiple colors (not uniform)
    - Appear after page 0
    """
    # Let watermark check decide
    return not is_watermark_image(img_data, img_w, img_h, page_w, page_h, page_num)


# --- Page Extraction ---

def extract_page(doc, page_num):
    """
    Extract content from a page as positioned items.
    Uses default text extraction (no TEXT_PRESERVE_WHITESPACE) for proper spacing.
    """
    page = doc[page_num]
    rect = page.rect
    items = []

    # 1. Detect tables
    table_rects = []
    try:
        tabs = page.find_tables()
        if tabs and tabs.tables:
            for tab in tabs.tables:
                rows = tab.extract()
                if rows and len(rows) > 1:
                    clean_rows = []
                    for row in rows:
                        clean_row = [clean_cell_text(str(cell)) if cell else '' for cell in row]
                        clean_rows.append(clean_row)
                    # Check table has real content
                    total_content = sum(len(c) for row in clean_rows for c in row)
                    if total_content > 20:
                        items.append({
                            "type": "table",
                            "y": tab.bbox[1],
                            "data": clean_rows
                        })
                        table_rects.append(tab.bbox)
    except Exception:
        pass

    # 2. Extract text - NO TEXT_PRESERVE_WHITESPACE so PyMuPDF adds spaces
    blocks = page.get_text("dict")["blocks"]

    for block in blocks:
        if block["type"] != 0:
            continue

        bbox = block["bbox"]
        # Skip if overlapping table
        in_table = False
        for trect in table_rects:
            if bbox[1] >= trect[1] - 5 and bbox[3] <= trect[3] + 5:
                in_table = True
                break
        if in_table:
            continue

        for line in block["lines"]:
            spans_data = []
            full_text = ""

            for span in line["spans"]:
                t = span["text"]
                if not t.strip():
                    continue
                if is_watermark_text(t):
                    continue
                spans_data.append({
                    "text": t,
                    "size": span["size"],
                    "flags": span["flags"],
                    "font": span["font"],
                })
                # Add space between spans if needed
                if full_text and not full_text.endswith(' ') and not t.startswith(' '):
                    full_text += ' '
                full_text += t

            full_text = full_text.strip()
            if not full_text or is_watermark_text(full_text):
                continue

            # Apply spacing fix
            full_text = fix_spacing(full_text)

            max_size = max((s["size"] for s in spans_data), default=10)
            any_bold = any(s["flags"] & 16 for s in spans_data)

            items.append({
                "type": "text",
                "y": line["bbox"][1],
                "data": {
                    "text": full_text,
                    "spans": spans_data,
                    "size": max_size,
                    "bold": any_bold,
                    "x": line["bbox"][0],
                    "width": line["bbox"][2] - line["bbox"][0],
                }
            })

    # 3. Extract images
    img_list = page.get_images(full=True)
    for img_info in img_list:
        xref = img_info[0]
        try:
            base = doc.extract_image(xref)
            img_data = base["image"]
            img_w = base["width"]
            img_h = base["height"]
            
            # Get RENDERED size on page (in points) for accurate size checks
            img_rects = page.get_image_rects(xref)
            if img_rects:
                rendered_w = img_rects[0].width
                rendered_h = img_rects[0].height
                y_pos = img_rects[0].y0
            else:
                rendered_w = img_w
                rendered_h = img_h
                y_pos = rect.height * 0.5
            
            if is_content_image(img_data, rendered_w, rendered_h, rect.width, rect.height, page_num):
                items.append({
                    "type": "image",
                    "y": y_pos,
                    "data": {"bytes": img_data, "ext": base["ext"],
                             "width": img_w, "height": img_h}
                })
        except Exception:
            continue

    items.sort(key=lambda x: x["y"])
    return items


# --- Text Merging & Classification ---

def classify(elem, page_width=595):
    """Classify a text element into a role."""
    text = elem["text"]
    size = elem["size"]
    bold = elem["bold"]
    x = elem.get("x", 0)

    # Bullet point detection
    if re.match(r'^[●•\-▶►]\s+', text):
        return "li"
    if re.match(r'^[○▪◦■▸]\s+', text):
        return "li-sub"
    # Numbered list
    if re.match(r'^\d+[.)]\s+', text) and len(text) < 200:
        return "li"

    # Headings
    if size >= 16:
        return "h2"
    if size >= 13 and bold:
        return "h2"
    if size >= 11 and bold and len(text) < 120:
        return "h3"

    return "p"


def should_merge_lines(prev, curr, page_width=595):
    """Determine if two consecutive text lines should merge into one paragraph."""
    if not prev or not curr:
        return False
    
    prev_data = prev["data"]
    curr_data = curr["data"]
    
    # Don't merge if roles differ significantly
    prev_role = classify(prev_data)
    curr_role = classify(curr_data)
    
    if prev_role != curr_role:
        return False
    if prev_role in ("h2", "h3"):
        return False  # Don't merge headings
    
    # Check Y gap - should be within normal line spacing
    y_gap = curr["y"] - prev["y"]
    line_height = prev_data["size"] * 1.5
    
    if y_gap > line_height * 1.8:
        return False  # Too much vertical gap = new paragraph
    
    # Check if previous line looks like it was cut mid-sentence
    prev_text = prev_data["text"].rstrip()
    curr_text = curr_data["text"].lstrip()
    
    # If prev line doesn't end with sentence terminator and is short, merge
    if not prev_text[-1:] in ('.', '!', '?', ':', ';') and len(prev_text) < page_width * 0.08:
        return True
    
    # If curr starts with lowercase, it's a continuation
    if curr_text and curr_text[0].islower():
        return True
    
    # If X positions are similar and gap is small, likely same paragraph
    x_diff = abs(curr_data["x"] - prev_data["x"])
    if x_diff < 30 and y_gap < line_height * 1.3:
        return True
    
    return False


def merge_items_to_blocks(text_items, page_width=595):
    """
    Merge text items into logical blocks (paragraphs, headings, list items).
    More aggressive merging to avoid fragmentation.
    """
    if not text_items:
        return []

    blocks = []
    i = 0

    while i < len(text_items):
        item = text_items[i]
        data = item["data"]
        role = classify(data, page_width)

        if role in ("h2", "h3"):
            blocks.append({
                "role": role,
                "text": data["text"],
                "spans": data["spans"],
            })
            i += 1
            continue

        if role in ("li", "li-sub"):
            # Collect the bullet text and any continuation lines
            text = re.sub(r'^[●•\-▶►○▪◦■▸]\s+', '', data["text"])
            text = re.sub(r'^\d+[.)]\s+', '', text)
            spans = list(data["spans"])
            j = i + 1
            # Merge continuation lines into this bullet
            while j < len(text_items):
                nxt = text_items[j]
                nxt_data = nxt["data"]
                nxt_role = classify(nxt_data, page_width)
                if nxt_role == "p":
                    y_gap = nxt["y"] - text_items[j-1]["y"]
                    if y_gap < data["size"] * 2.5:
                        text += " " + nxt_data["text"]
                        spans.extend(nxt_data["spans"])
                        j += 1
                    else:
                        break
                else:
                    break
            
            if text.strip():  # Skip empty bullets
                blocks.append({
                    "role": role,
                    "text": text.strip(),
                    "spans": spans,
                })
            i = j
            continue

        # Paragraph - merge consecutive paragraph lines
        text = data["text"]
        spans = list(data["spans"])
        j = i + 1
        while j < len(text_items):
            if should_merge_lines(text_items[j-1], text_items[j], page_width):
                nxt_data = text_items[j]["data"]
                nxt_role = classify(nxt_data, page_width)
                if nxt_role == "p":
                    text += " " + nxt_data["text"]
                    spans.extend(nxt_data["spans"])
                    j += 1
                else:
                    break
            else:
                break

        if text.strip():
            blocks.append({
                "role": "p",
                "text": text.strip(),
                "spans": spans,
            })
        i = j

    return blocks


# --- HTML Generation ---

def consolidate_bold_spans(spans):
    """
    Merge consecutive bold (or non-bold) spans to avoid word-by-word <strong> tags.
    Returns list of {text, bold, italic}.
    """
    if not spans:
        return []

    consolidated = []
    for span in spans:
        t = span["text"].strip()
        if not t or is_watermark_text(t):
            continue
        # Remove bullet chars from spans
        t = re.sub(r'^[●•\-○▪◦■▶►▸]\s*', '', t)
        if not t:
            continue

        bold = bool(span["flags"] & 16)
        italic = bool(span["flags"] & 2)
        
        # Apply spacing fix to individual spans too
        t = fix_spacing(t)

        if consolidated and consolidated[-1]["bold"] == bold and consolidated[-1]["italic"] == italic:
            consolidated[-1]["text"] += " " + t
        else:
            consolidated.append({"text": t, "bold": bold, "italic": italic})

    return consolidated


def spans_to_html(spans):
    """Convert spans to inline HTML with consolidated bold/italic."""
    parts = consolidate_bold_spans(spans)
    html_parts = []
    
    for part in parts:
        t = escape_html(part["text"])
        if part["bold"] and part["italic"]:
            html_parts.append(f"<strong><em>{t}</em></strong>")
        elif part["bold"]:
            html_parts.append(f"<strong>{t}</strong>")
        elif part["italic"]:
            html_parts.append(f"<em>{t}</em>")
        else:
            html_parts.append(t)

    result = " ".join(html_parts)
    # Clean up spacing around punctuation
    result = re.sub(r'\s+([,.:;!?)\]])', r'\1', result)
    result = re.sub(r'([([\[])\s+', r'\1', result)
    result = re.sub(r'\s{2,}', ' ', result)
    return result


def escape_html(text):
    """HTML-escape text."""
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;"))


def table_to_html(rows):
    """Render table as HTML."""
    if not rows or len(rows) < 2:
        return ""
    # Filter empty rows
    rows = [r for r in rows if any(c.strip() for c in r)]
    if len(rows) < 2:
        return ""

    h = ['<div class="table-wrapper"><table>', '<thead><tr>']
    for cell in rows[0]:
        h.append(f'<th>{escape_html(cell)}</th>')
    h.append('</tr></thead><tbody>')
    for row in rows[1:]:
        h.append('<tr>')
        for cell in row:
            h.append(f'<td>{escape_html(cell)}</td>')
        h.append('</tr>')
    h.append('</tbody></table></div>')
    return '\n'.join(h)


def blocks_to_html(blocks):
    """Convert merged blocks to HTML."""
    parts = []
    in_ul = False
    in_ol = False

    for block in blocks:
        role = block["role"]
        text = block["text"]

        # Close open lists if role isn't a list item
        if role not in ("li", "li-sub"):
            if in_ul:
                parts.append("</ul>")
                in_ul = False
            if in_ol:
                parts.append("</ol>")
                in_ol = False

        # Apply spacing fix to the display text
        display_text = fix_spacing(text)
        formatted = spans_to_html(block["spans"])
        # If spans produced empty output, use escaped display text
        if not formatted.strip():
            formatted = escape_html(display_text)

        if role == "h2":
            parts.append(f'<h2>{escape_html(display_text)}</h2>')
        elif role == "h3":
            parts.append(f'<h3>{escape_html(display_text)}</h3>')
        elif role in ("li", "li-sub"):
            if not in_ul:
                parts.append("<ul>")
                in_ul = True
            if formatted.strip():
                parts.append(f"<li>{formatted}</li>")
        elif role == "p":
            if formatted.strip():
                parts.append(f"<p>{formatted}</p>")

    # Close any open lists
    if in_ul:
        parts.append("</ul>")
    if in_ol:
        parts.append("</ol>")

    return "\n".join(parts)


# --- Main Conversion ---

def convert_pdf(pdf_path, output_dir, category, title=None, exam="General", verbose=False, pyq=""):
    """Convert a single PDF to HTML."""
    global _seen_img_hashes
    _seen_img_hashes = {}

    doc = fitz.open(pdf_path)
    if not title:
        title = Path(pdf_path).stem.replace("-", " ").replace("_", " ").title()

    slug = slugify(title)
    img_prefix = slug
    img_dir = os.path.join(output_dir, "images")
    os.makedirs(img_dir, exist_ok=True)

    page_width = doc[0].rect.width if len(doc) > 0 else 595

    all_items = []
    img_count = 0
    skipped_images = 0

    for pn in range(len(doc)):
        page = doc[pn]
        page_text = page.get_text().strip()

        # Skip cover/branding pages (first page with minimal real text)
        if pn == 0:
            # Remove watermark text to see what's left
            cleaned = page_text.lower()
            for pat in WATERMARK_PATTERNS:
                cleaned = re.sub(pat, '', cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned).strip()
            # If very little real text content, skip the cover page
            real_words = [w for w in cleaned.split() if len(w) > 3]
            if len(real_words) < 10:
                if verbose:
                    print(f"    Skipping page {pn+1} (cover/branding)")
                continue

        # Skip decorative title pages (page with only large text, no paragraphs)
        if pn <= 2:
            blocks = page.get_text("dict")["blocks"]
            text_blocks = [b for b in blocks if b.get("type") == 0]
            total_lines = sum(len(b.get("lines", [])) for b in text_blocks)
            # Count lines with large font (heading-like)
            large_lines = 0
            for b in text_blocks:
                for line in b.get("lines", []):
                    for span in line.get("spans", []):
                        if span.get("size", 0) >= 14:
                            large_lines += 1
                            break
            # If most lines are headings and there's very little content, it's a title card
            if total_lines > 0 and total_lines <= 8 and large_lines >= total_lines * 0.5:
                if verbose:
                    print(f"    Skipping page {pn+1} (decorative title page)")
                continue

        page_items = extract_page(doc, pn)

        # Process images
        for item in page_items:
            if item["type"] == "image":
                img_count += 1
                ext = item["data"]["ext"]
                if ext == "jpeg" or ext == "jpg":
                    ext = "jpg"
                fname = f"{img_prefix}_{img_count}.{ext}"
                img_path = os.path.join(img_dir, fname)
                with open(img_path, "wb") as f:
                    f.write(item["data"]["bytes"])
                item["data"] = {"path": f"images/{fname}",
                                "width": item["data"]["width"],
                                "height": item["data"]["height"]}

        all_items.extend(page_items)

    doc.close()

    # Build HTML body
    body_parts = []
    text_buffer = []

    for item in all_items:
        if item["type"] == "text":
            text_buffer.append(item)
        else:
            # Flush text buffer
            if text_buffer:
                blocks = merge_items_to_blocks(text_buffer, page_width)
                body_parts.append(blocks_to_html(blocks))
                text_buffer = []

            if item["type"] == "table":
                body_parts.append(table_to_html(item["data"]))
            elif item["type"] == "image":
                path = item["data"]["path"]
                body_parts.append(
                    f'<figure><img src="{path}" alt="Diagram" loading="lazy"></figure>'
                )

    # Flush remaining text
    if text_buffer:
        blocks = merge_items_to_blocks(text_buffer, page_width)
        body_parts.append(blocks_to_html(blocks))

    body_html = "\n".join(p for p in body_parts if p.strip())

    # Remove duplicate consecutive headings (same text)
    body_html = re.sub(r'(<h[23]>(.+?)</h[23]>)\s*\n?\s*<h[23]>\2</h[23]>', r'\1', body_html)
    
    # Remove garbled ALL-CAPS headings (title card remnants)
    # These appear at the start of the document from decorative title pages
    heading_count = [0]  # mutable counter for closure
    
    def is_garbled_heading(match):
        text = match.group(2)
        words = text.split()
        if len(words) < 2:
            return False
        
        heading_count[0] += 1
        alpha_chars = [c for c in text if c.isalpha()]
        if not alpha_chars:
            return False
        uppercase_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
        
        # First few headings that are mostly ALL-CAPS = title card remnants
        if heading_count[0] <= 3 and uppercase_ratio > 0.7:
            return True
        
        # Long concatenated tokens (>12 chars) in mostly-uppercase text
        has_long_token = any(len(w) > 12 for w in words if w.isalpha())
        if uppercase_ratio > 0.7 and has_long_token:
            return True
        
        # Multiple single-char fragments
        single_chars = sum(1 for w in words if len(w) == 1 and w.isalpha())
        if single_chars >= 2:
            return True
        
        return False
    
    body_html = re.sub(
        r'<(h[23])>(.+?)</\1>\n?',
        lambda m: '' if is_garbled_heading(m) else m.group(0),
        body_html
    )

    # Detect mnemonics/tricks and wrap in callout boxes
    mnemonic_patterns = [
        (r'<p>((?:TRICK|MNEMONIC|TIP|REMEMBER|NOTE|HINT|SHORTCUT|FORMULA)[:\s].+?)</p>', 'tip'),
        (r'<li>((?:TRICK|MNEMONIC|TIP|REMEMBER|NOTE|HINT|SHORTCUT|FORMULA)[:\s].+?)</li>', 'tip'),
    ]
    for pat, ctype in mnemonic_patterns:
        body_html = re.sub(pat, 
            lambda m: f'<div class="callout callout-{ctype}"><span class="callout-icon">💡</span> {m.group(1)}</div>', 
            body_html, flags=re.IGNORECASE)

    # Count words for reading time
    plain_text = re.sub(r'<[^>]+>', ' ', body_html)
    word_count = len(plain_text.split())

    # Get related notes from existing index
    related_notes = get_related_notes(str(Path(output_dir).parent.parent), category, title)

    # Generate page
    html = generate_page(title, category, body_html, exam, word_count, related_notes)
    out_path = os.path.join(output_dir, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"  ✓ {Path(pdf_path).name} → {slug}.html ({img_count} images)")

    # Gather keywords
    all_text = [item["data"] for item in all_items if item["type"] == "text"]
    keywords = extract_keywords(all_text)

    return {
        "title": title,
        "category": category,
        "path": f"notes/{category}/{slug}.html",
        "slug": slug,
        "exam": exam,
        "pyq": pyq,
        "keywords": keywords,
        "word_count": word_count,
        "reading_time": max(1, round(word_count / 200))
    }


def get_related_notes(base_dir, category, current_title):
    """Get related notes from same category for 'Related Notes' section."""
    idx_path = os.path.join(base_dir, "notes", "index.json")
    if not os.path.exists(idx_path):
        return []
    try:
        with open(idx_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        related = []
        for note in data.get("notes", []):
            if note.get("category") == category and note.get("title") != current_title:
                # Get just the filename relative to the category folder
                path = note.get("path", "")
                filename = path.split("/")[-1] if "/" in path else path
                related.append({
                    "title": note["title"],
                    "file": filename,
                    "exam": note.get("exam", "")
                })
        return related[:4]
    except Exception:
        return []


def generate_page(title, category, body, exam, word_count=0, related_notes=None):
    """Generate full HTML page with all features."""
    cat_display = category.replace('-', ' ').title()
    title_esc = escape_html(title)
    cat_esc = escape_html(cat_display)
    exam_esc = escape_html(exam)
    reading_time = max(1, round(word_count / 200))
    
    related_html = ""
    if related_notes:
        cards = ""
        for note in related_notes[:4]:
            cards += f'<a href="{note["file"]}" class="note-card"><h4>{escape_html(note["title"])}</h4><div class="meta">{escape_html(note.get("exam", ""))}</div></a>'
        related_html = f'''
            <section class="related-notes">
                <h3>Related Notes</h3>
                <div class="related-grid">{cards}</div>
            </section>'''
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_esc} - Laurel Library</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="manifest" href="../../manifest.json">
    <meta name="theme-color" content="#5c3d2e">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="logo">
                <a href="../../index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
                    <span class="logo-icon">&#128218;</span>
                    <h1>Laurel Library</h1>
                </a>
            </div>
            <nav class="main-nav">
                <a href="../../index.html">Home</a>
                <a href="../index.html">Notes</a>
                <a href="../../exams/index.html">Exams</a>
                <a href="../../about.html">About</a>
            </nav>
            <div class="header-actions">
                <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode">
                    <span class="icon-sun">&#9728;&#65039;</span>
                    <span class="icon-moon">&#127769;</span>
                </button>
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search notes..." autocomplete="off">
                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <div class="breadcrumbs">
                <a href="../../index.html">Home</a>
                <span>&rsaquo;</span>
                <a href="index.html">{cat_esc}</a>
                <span>&rsaquo;</span>
                <span>{title_esc}</span>
            </div>

            <div class="note-actions">
                <button class="btn-bookmark" id="btn-bookmark" title="Bookmark this note">
                    <span class="bookmark-icon">&#9734;</span> Bookmark
                </button>
                <button class="btn-print" onclick="window.print()" title="Print this note">
                    &#128424; Print
                </button>
                <button class="btn-quiz" id="btn-quiz" title="Quiz yourself">
                    &#128300; Quiz
                </button>
                <span class="reading-time">&#128337; {reading_time} min read</span>
            </div>

            <div class="notes-page">
                <aside class="sidebar" id="toc-sidebar">
                    <h4 class="toc-header">
                        <span>Table of Contents</span>
                        <button class="toc-collapse-btn" id="toc-collapse-all" title="Collapse all">&#9660;</button>
                    </h4>
                    <ul id="toc-list"></ul>
                </aside>

                <article class="article-content" id="article-content">
                    <h1>{title_esc}</h1>
                    <div class="meta">
                        <span class="meta-category">{cat_esc}</span>
                        <span class="meta-separator">&bull;</span>
                        <span class="meta-exam">{exam_esc}</span>
                    </div>
                    {body}
                    {related_html}
                </article>
            </div>
        </div>
    </main>

    <!-- Quiz Modal -->
    <div class="modal" id="quiz-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Quiz Mode</h3>
                <button class="modal-close" id="quiz-close">&times;</button>
            </div>
            <div class="modal-body" id="quiz-body"></div>
        </div>
    </div>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 Laurel Library. Free educational resource for competitive exam aspirants.</p>
        </div>
    </footer>

    <script src="../../assets/js/search.js"></script>
    <script src="../../assets/js/features.js"></script>
    <script>
        // TOC generation with collapse support
        (function() {{
            var article = document.getElementById('article-content');
            var tocList = document.getElementById('toc-list');
            if (!article || !tocList) return;
            var headings = article.querySelectorAll('h2, h3');
            var currentH2 = null;
            var currentSubList = null;
            headings.forEach(function(heading, idx) {{
                var id = 'section-' + idx;
                heading.id = id;
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = '#' + id;
                a.textContent = heading.textContent;
                if (heading.tagName === 'H2') {{
                    li.classList.add('toc-parent');
                    var toggle = document.createElement('button');
                    toggle.className = 'toc-toggle';
                    toggle.innerHTML = '&#9660;';
                    toggle.addEventListener('click', function(e) {{
                        e.preventDefault();
                        var sub = li.querySelector('.toc-children');
                        if (sub) {{
                            sub.classList.toggle('collapsed');
                            toggle.innerHTML = sub.classList.contains('collapsed') ? '&#9654;' : '&#9660;';
                        }}
                    }});
                    li.appendChild(a);
                    li.appendChild(toggle);
                    currentSubList = document.createElement('ul');
                    currentSubList.className = 'toc-children';
                    li.appendChild(currentSubList);
                    tocList.appendChild(li);
                    currentH2 = li;
                }} else {{
                    li.classList.add('toc-sub');
                    li.appendChild(a);
                    if (currentSubList) {{
                        currentSubList.appendChild(li);
                    }} else {{
                        tocList.appendChild(li);
                    }}
                }}
            }});
            // Collapse all button
            var collapseBtn = document.getElementById('toc-collapse-all');
            if (collapseBtn) {{
                var allCollapsed = false;
                collapseBtn.addEventListener('click', function() {{
                    allCollapsed = !allCollapsed;
                    document.querySelectorAll('.toc-children').forEach(function(sub) {{
                        if (allCollapsed) sub.classList.add('collapsed');
                        else sub.classList.remove('collapsed');
                    }});
                    document.querySelectorAll('.toc-toggle').forEach(function(t) {{
                        t.innerHTML = allCollapsed ? '&#9654;' : '&#9660;';
                    }});
                    collapseBtn.innerHTML = allCollapsed ? '&#9654;' : '&#9660;';
                }});
            }}
        }})();
    </script>
</body>
</html>"""


# --- Utilities ---

def slugify(text):
    """Create URL-safe slug."""
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')[:80]  # Cap length for very long titles


def extract_keywords(elements):
    """Extract search keywords from text elements."""
    words = set()
    for el in elements:
        text = el.get("text", "")
        text = fix_spacing(text)
        for w in text.lower().split():
            w = re.sub(r'[^a-z]', '', w)
            if 3 < len(w) < 20:
                words.add(w)
    return " ".join(sorted(list(words))[:50])


def update_indexes(base_dir, note_info):
    """Update notes/index.json and search-index.json."""
    idx_path = os.path.join(base_dir, "notes", "index.json")
    if os.path.exists(idx_path):
        with open(idx_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"notes": []}

    existing = next((n for n in data["notes"] if n["path"] == note_info["path"]), None)
    if existing:
        existing.update(note_info)
    else:
        data["notes"].append(note_info)

    os.makedirs(os.path.dirname(idx_path), exist_ok=True)
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    search_path = os.path.join(base_dir, "search-index.json")
    if os.path.exists(search_path):
        with open(search_path, "r", encoding="utf-8") as f:
            search_data = json.load(f)
    else:
        search_data = []

    ex = next((s for s in search_data if s["path"] == note_info["path"]), None)
    if ex:
        ex.update(note_info)
    else:
        search_data.append(note_info)

    with open(search_path, "w", encoding="utf-8") as f:
        json.dump(search_data, f, indent=2, ensure_ascii=False)


# --- Entry Point ---

def main():
    parser = argparse.ArgumentParser(description="Convert PDFs to HTML for Laurel Library")
    parser.add_argument("input", help="PDF file or folder of PDFs")
    parser.add_argument("--category", "-c", required=True, help="Category slug (e.g., geography)")
    parser.add_argument("--title", "-t", help="Note title (auto-detected if omitted)")
    parser.add_argument("--exam", "-e", default="General", help="Target exams (e.g., 'UPSC, SSC')")
    parser.add_argument("--pyq", default="", help="PYQ references (e.g., 'SSC CGL 2024, UPSC Prelims 2023')")
    parser.add_argument("--output", "-o", default=None, help="Output base directory")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    args = parser.parse_args()

    base = Path(args.output) if args.output else Path(__file__).parent.parent
    out_dir = base / "notes" / args.category
    os.makedirs(out_dir, exist_ok=True)

    # Ensure category index exists
    cat_index = out_dir / "index.html"
    if not cat_index.exists():
        create_category_index(out_dir, args.category)

    inp = Path(args.input)
    start_time = time.time()

    if inp.is_file() and inp.suffix.lower() == '.pdf':
        info = convert_pdf(str(inp), str(out_dir), args.category, args.title, args.exam, args.verbose, args.pyq)
        update_indexes(str(base), info)
    elif inp.is_dir():
        pdfs = sorted(inp.glob("*.pdf"))
        total = len(pdfs)
        print(f"Found {total} PDFs in {inp.name}/")
        print(f"{'─' * 50}")
        
        success = 0
        errors = []
        for i, pdf in enumerate(pdfs, 1):
            print(f"  [{i}/{total}] Processing: {pdf.name}")
            try:
                info = convert_pdf(str(pdf), str(out_dir), args.category, None, args.exam, args.verbose, args.pyq)
                update_indexes(str(base), info)
                success += 1
            except Exception as e:
                errors.append((pdf.name, str(e)))
                print(f"  ✗ ERROR: {pdf.name}: {e}")
                if args.verbose:
                    import traceback
                    traceback.print_exc()
        
        elapsed = time.time() - start_time
        print(f"{'─' * 50}")
        print(f"Done! {success}/{total} converted in {elapsed:.1f}s")
        if errors:
            print(f"\n{len(errors)} errors:")
            for name, err in errors:
                print(f"  - {name}: {err}")
    else:
        print(f"Error: {args.input} is not a valid PDF or directory")
        sys.exit(1)

    elapsed = time.time() - start_time
    if elapsed > 0:
        print(f"\nTotal time: {elapsed:.1f}s")
    print(f"Preview: py -m http.server 8000")


def create_category_index(out_dir, category):
    """Create a basic category index page."""
    cat_display = category.replace('-', ' ').title()
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{cat_display} - Laurel Library</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="manifest" href="../../manifest.json">
    <meta name="theme-color" content="#5c3d2e">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="logo">
                <a href="../../index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
                    <span class="logo-icon">&#128218;</span>
                    <h1>Laurel Library</h1>
                </a>
            </div>
            <nav class="main-nav">
                <a href="../../index.html">Home</a>
                <a href="../index.html">Notes</a>
                <a href="../../exams/index.html">Exams</a>
                <a href="../../about.html">About</a>
            </nav>
            <div class="header-actions">
                <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode">
                    <span class="icon-sun">&#9728;&#65039;</span>
                    <span class="icon-moon">&#127769;</span>
                </button>
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search notes..." autocomplete="off">
                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        </div>
    </header>
    <main>
        <div class="container">
            <div class="breadcrumbs">
                <a href="../../index.html">Home</a>
                <span>&rsaquo;</span>
                <a href="../index.html">Notes</a>
                <span>&rsaquo;</span>
                <span>{cat_display}</span>
            </div>
            <h2 class="section-title">{cat_display}</h2>
            <div class="notes-list" id="category-notes"></div>
        </div>
    </main>
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 Laurel Library. Free educational resource for competitive exam aspirants.</p>
        </div>
    </footer>
    <script src="../../assets/js/app.js"></script>
    <script src="../../assets/js/search.js"></script>
    <script src="../../assets/js/features.js"></script>
    <script>
        fetch('../../notes/index.json')
            .then(r => r.json())
            .then(data => {{
                var container = document.getElementById('category-notes');
                var notes = data.notes.filter(n => n.category === '{category}');
                notes.forEach(function(note) {{
                    var a = document.createElement('a');
                    a.className = 'note-card';
                    a.href = note.path.replace('notes/{category}/', '');
                    a.innerHTML = '<h4>' + note.title + '</h4><div class="meta">' + note.exam + '</div>';
                    container.appendChild(a);
                }});
                if (notes.length === 0) {{
                    container.innerHTML = '<p>No notes yet in this category.</p>';
                }}
            }});
    </script>
</body>
</html>"""
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)


if __name__ == "__main__":
    main()
