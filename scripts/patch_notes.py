"""Patch existing note HTML files with accessibility/SEO fixes."""
import os
import re
import glob

notes_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "notes")
count = 0

for html_path in glob.glob(os.path.join(notes_dir, "**", "*.html"), recursive=True):
    # Skip index.html files (already updated manually)
    if os.path.basename(html_path) == "index.html":
        continue

    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. lang="en" -> lang="en-IN"
    content = content.replace('<html lang="en">', '<html lang="en-IN">')

    # 2. Add meta description after <title> if missing
    if '<meta name="description"' not in content:
        title_match = re.search(r'<title>(.*?) - Laurel Library</title>', content)
        if title_match:
            title_text = title_match.group(1)
            content = content.replace(
                f'<title>{title_text} - Laurel Library</title>',
                f'<title>{title_text} - Laurel Library</title>\n    <meta name="description" content="{title_text} - study notes for competitive exam preparation. Free on Laurel Library.">'
            )

    # 3. Add CSP meta tag after viewport if missing
    if 'Content-Security-Policy' not in content:
        content = content.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src \'self\' data:;">'
        )

    # 4. Add preconnect to fonts.gstatic.com if missing
    if 'fonts.gstatic.com' not in content:
        content = content.replace(
            '<link rel="preconnect" href="https://fonts.googleapis.com">',
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        )

    # 5. Add skip-to-content link after <body> if missing
    if 'skip-link' not in content:
        content = content.replace(
            '<body>\n    <header',
            '<body>\n    <a href="#article-content" class="skip-link">Skip to content</a>\n\n    <header'
        )

    # 6. Add role="banner" to header
    content = content.replace(
        '<header class="site-header">',
        '<header class="site-header" role="banner">'
    )

    # 7. Add role="navigation" to nav
    content = content.replace(
        '<nav class="main-nav">',
        '<nav class="main-nav" role="navigation" aria-label="Main navigation">'
    )

    # 8. Add role="search" and aria to search bar
    content = content.replace(
        '<div class="search-bar">',
        '<div class="search-bar" role="search">'
    )
    if 'aria-label="Search notes"' not in content:
        content = content.replace(
            'placeholder="Search notes..." autocomplete="off">',
            'placeholder="Search notes..." autocomplete="off" aria-label="Search notes" role="searchbox">'
        )

    # 9. Add role="contentinfo" to footer
    content = content.replace(
        '<footer class="site-footer">',
        '<footer class="site-footer" role="contentinfo">'
    )

    # 10. Add defer to scripts
    content = content.replace(
        '<script src="../../assets/js/search.js"></script>',
        '<script src="../../assets/js/search.js" defer></script>'
    )
    content = content.replace(
        '<script src="../../assets/js/features.js"></script>',
        '<script src="../../assets/js/features.js" defer></script>'
    )

    if content != original:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1
        print(f"  Patched: {os.path.relpath(html_path, notes_dir)}")

print(f"\nPatched {count} files.")
