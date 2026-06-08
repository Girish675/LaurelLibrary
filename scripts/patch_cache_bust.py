"""Patch all existing note HTML files to add CSS cache buster."""
import os, glob, re, time

NOTES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "notes")
timestamp = int(time.time())

html_files = glob.glob(os.path.join(NOTES_DIR, "**", "*.html"), recursive=True)
html_files = [f for f in html_files if os.path.basename(f) != "index.html"]

patched = 0
for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # Add cache buster to style.css link
    content = re.sub(
        r'href="../../assets/css/style\.css(?:\?v=\d+)?"',
        f'href="../../assets/css/style.css?v={timestamp}"',
        content
    )
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        patched += 1

print(f"Added cache buster v={timestamp} to {patched}/{len(html_files)} files")
