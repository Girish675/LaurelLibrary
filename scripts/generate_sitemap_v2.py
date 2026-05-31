"""Generate sitemap.xml including all new pages."""
import json, os
from datetime import date

BASE = 'https://girish675.github.io/LaurelLibrary'
TODAY = date.today().isoformat()

# Static pages with priorities
static_pages = [
    ('/', 1.0),
    ('/about.html', 0.5),
    ('/formulas.html', 0.6),
    ('/dashboard.html', 0.5),
    ('/notes/index.html', 0.8),
    ('/exams/index.html', 0.8),
    ('/subjects/index.html', 0.8),
    ('/tools/index.html', 0.7),
    ('/tools/pomodoro.html', 0.6),
    ('/tools/flashcards.html', 0.6),
    ('/tools/gpa-calculator.html', 0.6),
    ('/tools/planner.html', 0.6),
    ('/resources/index.html', 0.7),
    ('/notes/geography/index.html', 0.7),
]

# Load notes from index.json
notes_path = os.path.join(os.path.dirname(__file__), '..', 'notes', 'index.json')
with open(notes_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

urls = []
for path, priority in static_pages:
    urls.append(f'  <url>\n    <loc>{BASE}{path}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>{priority}</priority>\n  </url>')

for note in data.get('notes', []):
    urls.append(f'  <url>\n    <loc>{BASE}/{note["path"]}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>0.6</priority>\n  </url>')

sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>\n'

out_path = os.path.join(os.path.dirname(__file__), '..', 'sitemap.xml')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(sitemap)

print(f'Generated sitemap.xml with {len(urls)} URLs')
