"""Generate sitemap.xml from notes/index.json"""
import json
import datetime
import os

base_url = "https://girish675.github.io/LaurelLibrary"
today = datetime.date.today().isoformat()
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

pages = [
    ("", "1.0"),
    ("about.html", "0.5"),
    ("notes/index.html", "0.8"),
    ("exams/index.html", "0.8"),
    ("formulas.html", "0.6"),
]

idx_path = os.path.join(base_dir, "notes", "index.json")
if os.path.exists(idx_path):
    with open(idx_path, encoding="utf-8") as f:
        data = json.load(f)
    for note in data.get("notes", []):
        pages.append((note["path"], "0.7"))

xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
for path, priority in pages:
    url = f"{base_url}/{path}" if path else f"{base_url}/"
    xml_parts.append(f"  <url>")
    xml_parts.append(f"    <loc>{url}</loc>")
    xml_parts.append(f"    <lastmod>{today}</lastmod>")
    xml_parts.append(f"    <priority>{priority}</priority>")
    xml_parts.append(f"  </url>")
xml_parts.append("</urlset>")

out_path = os.path.join(base_dir, "sitemap.xml")
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(xml_parts) + "\n")

print(f"Generated sitemap.xml with {len(pages)} URLs")
