"""
Regenerate ALL electronics notes using the updated convert_pdf.py.
Also patches all notes with CSS cache buster.

Usage: cd c:\Girish\LaurelLibrary && py scripts/regenerate_all.py
"""
import os
import sys
import json
import glob
import re
import time

# Ensure we're in the project root
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT_DIR)
sys.path.insert(0, os.path.join(PROJECT_DIR, "scripts"))

from convert_pdf import convert_pdf, update_indexes

NOTES_DIR = os.path.join(PROJECT_DIR, "notes")
ELECTRONICS_DIR = os.path.join(PROJECT_DIR, "Electronics")
INDEX_PATH = os.path.join(NOTES_DIR, "index.json")

# Category mapping: folder name -> slug
CATEGORIES = {
    "Network Theory": "network-theory",
    "Analog Electronics": "analog-electronics",
    "Digital Electronics": "digital-electronics",
    "EDC": "edc",
}

def regenerate_all():
    """Regenerate all electronics notes from PDFs."""
    all_notes = []
    
    # Load existing index to preserve geography notes
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            existing = json.load(f)
        # Keep non-electronics notes (geography, etc.)
        for note in existing.get("notes", []):
            if note.get("category") not in CATEGORIES.values():
                all_notes.append(note)
                print(f"  ↳ Preserved: {note.get('title', '?')} ({note.get('category', '?')})")
    
    for folder_name, category_slug in CATEGORIES.items():
        pdf_dir = os.path.join(ELECTRONICS_DIR, folder_name)
        if not os.path.isdir(pdf_dir):
            print(f"  ⚠ Skipping {folder_name}: directory not found at {pdf_dir}")
            continue
        
        out_dir = os.path.join(NOTES_DIR, category_slug)
        os.makedirs(out_dir, exist_ok=True)
        
        # Clear old HTML and images
        for f in glob.glob(os.path.join(out_dir, "*.html")):
            os.remove(f)
        img_dir = os.path.join(out_dir, "images")
        if os.path.exists(img_dir):
            for f in os.listdir(img_dir):
                os.remove(os.path.join(img_dir, f))
        
        pdfs = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))
        print(f"\n📂 {folder_name} → {category_slug} ({len(pdfs)} PDFs)")
        print(f"   Output: {out_dir}")
        
        for i, pdf in enumerate(pdfs, 1):
            title = os.path.splitext(os.path.basename(pdf))[0]
            print(f"   [{i}/{len(pdfs)}] {os.path.basename(pdf)}")
            try:
                result = convert_pdf(pdf, out_dir, category_slug, title=title, verbose=True)
                all_notes.append(result)
            except Exception as e:
                print(f"   ✗ Error: {e}")
                import traceback
                traceback.print_exc()
    
    # Update index.json
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump({"notes": all_notes}, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Regenerated {len(all_notes)} total notes")
    print(f"   Index: {INDEX_PATH}")

def patch_cache_bust():
    """Add cache buster to all note CSS links."""
    timestamp = int(time.time())
    html_files = glob.glob(os.path.join(NOTES_DIR, "**", "*.html"), recursive=True)
    html_files = [f for f in html_files if os.path.basename(f) != "index.html"]
    
    patched = 0
    for filepath in html_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_content = re.sub(
            r'href="../../assets/css/style\.css(?:\?v=\d+)?"',
            f'href="../../assets/css/style.css?v={timestamp}"',
            content
        )
        
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            patched += 1
    
    print(f"\n🔧 Cache busted {patched}/{len(html_files)} files (v={timestamp})")


if __name__ == "__main__":
    print("=" * 60)
    print("  Laurel Library — Note Regeneration (Quality Rewrite)")
    print("=" * 60)
    
    start = time.time()
    regenerate_all()
    patch_cache_bust()
    
    elapsed = time.time() - start
    print(f"\n✅ All done in {elapsed:.1f}s!")
    print(f"   Preview: py -m http.server 8000")
