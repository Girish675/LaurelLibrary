"""
PDF to HTML Converter for Laurel Library (v2 - Improved)
Converts PDF study notes to clean HTML pages with watermark removal.

Key features:
- Watermark text and image filtering
- Proper table detection and rendering
- Paragraph merging (handles line-wrapped text)
- Proper bullet list handling
- Clean output without artifacts

Requirements:
    pip install PyMuPDF Pillow

Usage:
    py convert_pdf.py input.pdf --category geography --title "India: Location and Size"
    py convert_pdf.py input_folder/ --category geography  (batch mode)
"""

import fitz  # PyMuPDF
import os
import sys
import json
import argparse
import re
from pathlib import Path
from PIL import Image
import io


# Watermark patterns to detect and remove
WATERMARK_PATTERNS = [
    r'testbook\.com',
    r'testbook',
    r'PASS\s*PRO\s*MAX',
    r'pass\s*pro\s*max',
    r'www\.testbook\.com',
]

WATERMARK_EXACT = {'testbook', 'testbook.com', 'www.testbook.com', 'pass pro max',
                   'pass', 'pro', 'max', 'pass pro', 'pro max'}


def is_watermark_text(text):
    """Check if text is a watermark."""
    text_clean = text.strip().lower()
    if not text_clean:
        return True
    if text_clean in WATERMARK_EXACT:
        return True
    for pattern in WATERMARK_PATTERNS:
        if re.search(pattern, text_clean):
            return True
    return False


def clean_cell_text(text):
    """Remove watermark text from table cells."""
    if not text:
        return ''
    for pattern in WATERMARK_PATTERNS:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text.strip()


def is_watermark_image(img_data, img_w, img_h, page_w, page_h):
    """Check if image is a watermark/logo."""
    try:
        # Known repeated watermark sizes (testbook logo, badge, etc.)
        data_len = len(img_data)
        if data_len in (11863, 50472):  # Known watermark image sizes
            return True
        if img_w < 150 and img_h < 80:
            return True
        if img_w > page_w * 0.7 and img_h < 120:
            return True
        image = Image.open(io.BytesIO(img_data))
        if image.mode == 'RGBA':
            alpha = image.split()[3]
            pixels = list(alpha.getdata())
            transparent = sum(1 for p in pixels if p < 50)
            if transparent > len(pixels) * 0.6:
                return True
        return False
    except Exception:
        return False


def extract_page(doc, page_num):
    """Extract structured content from a single page."""
    page = doc[page_num]
    rect = page.rect

    # 1. Detect tables
    tables = []
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
                    # Only keep tables with meaningful content
                    total_content = sum(len(c) for row in clean_rows for c in row)
                    if total_content > 20:
                        tables.append(clean_rows)
                        table_rects.append(tab.bbox)
    except Exception:
        pass

    # 2. Extract text elements (skip table areas)
    elements = []
    blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

    for block in blocks:
        if block["type"] != 0:
            continue

        bbox = block["bbox"]
        # Skip if inside a table rect
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
                # Skip zero-width space
                if t.strip() in ('', '\u200b', '​'):
                    continue
                if is_watermark_text(t):
                    continue
                spans_data.append({
                    "text": t,
                    "size": span["size"],
                    "flags": span["flags"],
                    "font": span["font"],
                })
                full_text += t

            full_text = full_text.strip()
            if not full_text or is_watermark_text(full_text):
                continue

            max_size = max((s["size"] for s in spans_data), default=10)
            any_bold = any(s["flags"] & 16 for s in spans_data)

            elements.append({
                "text": full_text,
                "spans": spans_data,
                "size": max_size,
                "bold": any_bold,
                "x": line["bbox"][0],
                "y": line["bbox"][1],
            })

    # 3. Extract useful images
    images = []
    for img_info in page.get_images(full=True):
        xref = img_info[0]
        try:
            base = doc.extract_image(xref)
            if not is_watermark_image(base["image"], base["width"], base["height"], rect.width, rect.height):
                images.append({"data": base["image"], "ext": base["ext"]})
        except Exception:
            continue

    return elements, tables, images


def classify(elem):
    """Classify element role."""
    text = elem["text"]
    size = elem["size"]
    bold = elem["bold"]

    if size >= 16:
        return "h1"
    if size >= 13 and bold:
        return "h2"
    if size >= 11 and bold and len(text) < 100:
        return "h3"
    if re.match(r'^[●•\-]\s*\u200b?\s*', text):
        return "li"
    if re.match(r'^[○▪◦]\s*\u200b?\s*', text) or (elem["x"] > 85 and re.match(r'^[○▪◦■]\s', text)):
        return "li-sub"
    return "p"


def merge_elements(elements):
    """Merge line-wrapped text into coherent blocks."""
    if not elements:
        return []

    merged = []
    i = 0

    while i < len(elements):
        el = elements[i]
        role = classify(el)

        if role in ("h1", "h2", "h3"):
            merged.append({"role": role, "text": el["text"], "spans": el["spans"]})
            i += 1
            continue

        if role in ("li", "li-sub"):
            # Strip bullet character and zero-width space
            text = re.sub(r'^[●•\-○▪◦■]\s*\u200b?\s*', '', el["text"])
            spans = list(el["spans"])
            j = i + 1
            # Merge continuation lines
            while j < len(elements):
                nxt = elements[j]
                nxt_role = classify(nxt)
                if nxt_role == "p":
                    gap = nxt["y"] - elements[j-1]["y"]
                    if gap < el["size"] * 2 and abs(nxt["x"] - el["x"]) < 40:
                        text += " " + nxt["text"]
                        spans.extend(nxt["spans"])
                        j += 1
                    else:
                        break
                else:
                    break
            merged.append({"role": role, "text": text.strip(), "spans": spans})
            i = j
            continue

        # Paragraph - merge wrapped lines
        text = el["text"]
        spans = list(el["spans"])
        j = i + 1
        while j < len(elements):
            nxt = elements[j]
            nxt_role = classify(nxt)
            if nxt_role != "p":
                break
            gap = nxt["y"] - elements[j-1]["y"]
            if gap < el["size"] * 2 and abs(nxt["x"] - el["x"]) < 30:
                text += " " + nxt["text"]
                spans.extend(nxt["spans"])
                j += 1
            else:
                break
        merged.append({"role": "p", "text": text.strip(), "spans": spans})
        i = j

    return merged


def spans_to_html(spans):
    """Convert spans to formatted HTML."""
    parts = []
    for span in spans:
        t = span["text"].strip()
        if not t or t == '\u200b' or is_watermark_text(t):
            continue
        # Remove bullet characters from span text
        t = re.sub(r'^[●•\-○▪◦■]\s*\u200b?\s*', '', t)
        if not t:
            continue
        t_esc = escape(t)
        bold = span["flags"] & 16
        italic = span["flags"] & 2
        if bold and italic:
            parts.append(f"<strong><em>{t_esc}</em></strong>")
        elif bold:
            parts.append(f"<strong>{t_esc}</strong>")
        elif italic:
            parts.append(f"<em>{t_esc}</em>")
        else:
            parts.append(t_esc)

    result = " ".join(parts)
    # Fix spacing around punctuation
    result = re.sub(r'\s+([,.:;!?)\]])', r'\1', result)
    result = re.sub(r'([([\[])\s+', r'\1', result)
    result = re.sub(r'\s{2,}', ' ', result)
    return result


def escape(text):
    """HTML-escape text."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def table_html(rows):
    """Convert table rows to HTML table element."""
    if not rows or len(rows) < 2:
        return ""
    # Remove empty rows
    rows = [r for r in rows if any(c.strip() for c in r)]
    if len(rows) < 2:
        return ""

    h = ['<table>', '<thead><tr>']
    for cell in rows[0]:
        h.append(f'<th>{escape(cell)}</th>')
    h.append('</tr></thead><tbody>')
    for row in rows[1:]:
        h.append('<tr>')
        for cell in row:
            h.append(f'<td>{escape(cell)}</td>')
        h.append('</tr>')
    h.append('</tbody></table>')
    return '\n'.join(h)


def build_body(merged, tables, images_html):
    """Build the article body HTML."""
    parts = []
    in_ul = False
    in_sub = False
    seen_h1 = set()

    for el in merged:
        role = el["role"]
        text = el["text"]

        # Deduplicate h1
        if role == "h1":
            key = text.lower().strip()
            if key in seen_h1:
                continue
            seen_h1.add(key)

        # Close lists if leaving list context
        if role not in ("li", "li-sub"):
            if in_sub:
                parts.append("</ul></li>")
                in_sub = False
            if in_ul:
                parts.append("</ul>")
                in_ul = False

        formatted = spans_to_html(el["spans"])

        if role == "h1":
            parts.append(f'<h2>{escape(text)}</h2>')
        elif role == "h2":
            parts.append(f'<h2>{escape(text)}</h2>')
        elif role == "h3":
            parts.append(f'<h3>{escape(text)}</h3>')
        elif role == "li":
            if in_sub:
                parts.append("</ul></li>")
                in_sub = False
            if not in_ul:
                parts.append("<ul>")
                in_ul = True
            parts.append(f"<li>{formatted}</li>")
        elif role == "li-sub":
            if not in_ul:
                parts.append("<ul>")
                in_ul = True
            if not in_sub:
                if parts[-1].endswith("</li>"):
                    parts[-1] = parts[-1][:-5]
                    parts.append("<ul>")
                else:
                    parts.append("<li><ul>")
                in_sub = True
            parts.append(f"<li>{formatted}</li>")
        else:
            if formatted.strip():
                parts.append(f"<p>{formatted}</p>")

    if in_sub:
        parts.append("</ul></li>")
    if in_ul:
        parts.append("</ul>")

    # Add tables
    for t in tables:
        parts.append(table_html(t))

    # Add images
    if images_html:
        parts.append(images_html)

    return "\n".join(parts)


def generate_page(title, category, body, exam):
    """Generate the full HTML page."""
    cat_display = category.replace('-', ' ').title()
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)} - Laurel Library</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="logo">
                <span class="logo-icon">&#128218;</span>
                <h1>Laurel Library</h1>
            </div>
            <nav class="main-nav">
                <a href="../../index.html">Home</a>
                <a href="../index.html">Notes</a>
                <a href="../../about.html">About</a>
            </nav>
            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Search notes..." autocomplete="off">
                <div id="search-results" class="search-results"></div>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <div class="breadcrumbs">
                <a href="../../index.html">Home</a>
                <span>&rsaquo;</span>
                <a href="index.html">{escape(cat_display)}</a>
                <span>&rsaquo;</span>
                {escape(title)}
            </div>

            <div class="notes-page">
                <aside class="sidebar" id="toc-sidebar">
                    <h4>Table of Contents</h4>
                    <ul id="toc-list"></ul>
                </aside>

                <article class="article-content">
                    <h1>{escape(title)}</h1>
                    <div class="meta" style="margin-bottom:20px; color: var(--color-text-light);">
                        {escape(cat_display)} &bull; {escape(exam)}
                    </div>
                    {body}
                </article>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 Laurel Library. Free educational resource for competitive exam aspirants.</p>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            var article = document.querySelector('.article-content');
            var tocList = document.getElementById('toc-list');
            var headings = article.querySelectorAll('h2, h3');
            headings.forEach(function(heading, idx) {{
                var id = 'section-' + idx;
                heading.id = id;
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = '#' + id;
                a.textContent = heading.textContent;
                if (heading.tagName === 'H3') {{
                    a.style.paddingLeft = '20px';
                    a.style.fontSize = '0.85rem';
                }}
                li.appendChild(a);
                tocList.appendChild(li);
            }});
        }});
    </script>
    <script src="../../assets/js/search.js"></script>
</body>
</html>"""


def slugify(text):
    """URL-safe slug."""
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


def extract_keywords(elements):
    """Extract keywords for search."""
    words = set()
    for el in elements:
        # Split on whitespace and also break camelCase/concatenated words
        text = el["text"]
        # Insert spaces before capital letters in concatenated text
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        for w in text.lower().split():
            w = re.sub(r'[^a-z]', '', w)
            if 3 < len(w) < 20:  # Skip very short and very long (concatenated) words
                words.add(w)
    return " ".join(sorted(list(words))[:40])


def update_indexes(base_dir, note_info):
    """Update index files."""
    # notes/index.json
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

    # search-index.json
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


def convert_pdf(pdf_path, output_dir, category, title=None, exam="General"):
    """Main entry: convert one PDF to HTML."""
    doc = fitz.open(pdf_path)
    if not title:
        title = Path(pdf_path).stem.replace("-", " ").replace("_", " ").title()

    all_elements = []
    all_tables = []
    all_images = []
    img_idx = 0

    for pn in range(len(doc)):
        # Skip pure cover pages
        page_text = doc[pn].get_text().strip()
        cleaned = clean_cell_text(page_text)
        if pn == 0 and len(cleaned) < 80:
            continue

        elems, tables, images = extract_page(doc, pn)
        all_elements.extend(elems)
        all_tables.extend(tables)

        for img in images:
            img_idx += 1
            fname = f"img_{img_idx}.{img['ext']}"
            img_dir = os.path.join(output_dir, "images")
            os.makedirs(img_dir, exist_ok=True)
            with open(os.path.join(img_dir, fname), "wb") as f:
                f.write(img["data"])
            all_images.append(f"images/{fname}")

    doc.close()

    # Merge fragmented lines
    merged = merge_elements(all_elements)

    # Build images HTML
    imgs_html = "\n".join(
        f'<figure><img src="{p}" alt="Diagram" loading="lazy"></figure>' for p in all_images
    ) if all_images else ""

    # Build body
    body = build_body(merged, all_tables, imgs_html)

    # Generate full page HTML
    slug = slugify(title)
    html = generate_page(title, category, body, exam)

    out_path = os.path.join(output_dir, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"  OK: {Path(pdf_path).name} -> {slug}.html")
    return {
        "title": title,
        "category": category,
        "path": f"notes/{category}/{slug}.html",
        "exam": exam,
        "keywords": extract_keywords(merged)
    }


def main():
    parser = argparse.ArgumentParser(description="Convert PDFs to HTML for Laurel Library")
    parser.add_argument("input", help="PDF file or folder of PDFs")
    parser.add_argument("--category", "-c", required=True, help="Category slug")
    parser.add_argument("--title", "-t", help="Note title (auto-detected if omitted)")
    parser.add_argument("--exam", "-e", default="General", help="Target exam")
    parser.add_argument("--output", "-o", default=None, help="Output base directory")
    args = parser.parse_args()

    base = Path(args.output) if args.output else Path(__file__).parent.parent
    out_dir = base / "notes" / args.category
    os.makedirs(out_dir, exist_ok=True)

    inp = Path(args.input)
    if inp.is_file() and inp.suffix.lower() == '.pdf':
        info = convert_pdf(str(inp), str(out_dir), args.category, args.title, args.exam)
        update_indexes(str(base), info)
    elif inp.is_dir():
        pdfs = sorted(inp.glob("*.pdf"))
        print(f"Found {len(pdfs)} PDFs...")
        for pdf in pdfs:
            try:
                info = convert_pdf(str(pdf), str(out_dir), args.category, None, args.exam)
                update_indexes(str(base), info)
            except Exception as e:
                print(f"  ERROR: {pdf.name}: {e}")
    else:
        print(f"Error: {args.input} is not a valid PDF or directory")
        sys.exit(1)

    print(f"\nDone! Preview with: py -m http.server 8000")


if __name__ == "__main__":
    main()
