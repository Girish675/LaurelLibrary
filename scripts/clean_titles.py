"""One-off cleanup: fix note titles that have collapsed multi-spaces and
leading numeric prefixes (artifacts from PDF conversion).

Cleans:
  - <title>, first <h1>, breadcrumb final <span>, and meta description in note HTML
  - "title" fields in notes/index.json and search-index.json
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES_DIR = ROOT / "notes"


def clean_title(text: str) -> str:
    # strip leading "01 " style numeric prefix
    text = re.sub(r"^\s*\d+\s+", "", text)
    # turn runs of 2+ spaces (lost separators) into an em dash
    text = re.sub(r"\s{2,}", " \u2014 ", text)
    return text.strip()


def process_html(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    original = html

    # <title>RAW — Laurel Library</title>
    def fix_title_tag(m):
        inner = m.group(1)
        if inner.endswith(" \u2014 Laurel Library"):
            raw = inner[: -len(" \u2014 Laurel Library")]
            return "<title>" + clean_title(raw) + " \u2014 Laurel Library</title>"
        return "<title>" + clean_title(inner) + "</title>"

    html = re.sub(r"<title>(.*?)</title>", fix_title_tag, html, count=1, flags=re.S)

    # meta description: "RAW - study notes ..."
    def fix_desc(m):
        content = m.group(1)
        parts = content.split(" - ", 1)
        parts[0] = clean_title(parts[0])
        return '<meta name="description" content="' + " - ".join(parts) + '">'

    html = re.sub(r'<meta name="description" content="(.*?)">', fix_desc, html, count=1, flags=re.S)

    # first <h1>RAW</h1>
    html = re.sub(r"<h1>(.*?)</h1>", lambda m: "<h1>" + clean_title(m.group(1)) + "</h1>", html, count=1, flags=re.S)

    # breadcrumb final span: <span>RAW</span>\n</nav>
    def fix_crumb(m):
        return "<span>" + clean_title(m.group(1)) + "</span>" + m.group(2)

    html = re.sub(r"<span>([^<]*?)</span>(\s*</nav>)", fix_crumb, html, count=1, flags=re.S)

    if html != original:
        path.write_text(html, encoding="utf-8", newline="")
        return True
    return False


def process_json(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    items = data["notes"] if isinstance(data, dict) and "notes" in data else data
    changed = 0
    for item in items:
        if "title" in item:
            new = clean_title(item["title"])
            if new != item["title"]:
                item["title"] = new
                changed += 1
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return changed


def main():
    html_changed = 0
    for path in NOTES_DIR.rglob("*.html"):
        if path.name == "index.html":
            continue
        if process_html(path):
            html_changed += 1
    print(f"HTML note files cleaned: {html_changed}")

    for jf in [NOTES_DIR / "index.json", ROOT / "search-index.json"]:
        if jf.exists():
            print(f"{jf.name}: {process_json(jf)} titles cleaned")


if __name__ == "__main__":
    main()
