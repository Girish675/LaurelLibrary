"""
Patch geography note HTMLs to use new Laurel Library v2.0 design system.
Rewrites header, footer, fonts, and script loading while preserving article content.
"""
import os, re

NOTES_DIR = r'c:\Girish\LaurelLibrary\notes\geography'

def patch_note(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract title from <title> tag
    title_match = re.search(r'<title>(.*?)\s*-\s*Laurel Library</title>', html)
    title = title_match.group(1).strip() if title_match else 'Study Notes'

    # Extract description
    desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
    desc = desc_match.group(1) if desc_match else title + ' - study notes for competitive exam preparation.'

    # Extract reading time
    rt_match = re.search(r'(\d+)\s*min read', html)
    reading_time = rt_match.group(1) if rt_match else '5'

    # Extract article content (between <article> tags)
    article_match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    if not article_match:
        print(f'  SKIP: No article found in {os.path.basename(filepath)}')
        return False
    article_content = article_match.group(1).strip()

    # Build new HTML
    new_html = f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';">
    <title>{title} — Laurel Library</title>
    <meta name="description" content="{desc}">
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="manifest" href="../../manifest.json">
    <meta name="theme-color" content="#1a202c">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <script src="../../assets/js/components.js"></script>
    <script>document.write(LL.renderHeader('notes'));document.write(LL.renderSearchModal());</script>

    <main id="main-content">
        <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="../../index.html">Home</a>
                <span>/</span>
                <a href="../index.html">Notes</a>
                <span>/</span>
                <a href="index.html">Geography</a>
                <span>/</span>
                <span>{title}</span>
            </nav>

            <div class="note-actions">
                <button type="button" class="btn btn-sm" id="btn-bookmark" title="Save this note">&#9734; Save</button>
                <button type="button" class="btn btn-sm" id="btn-print" title="Print this note">&#128424; Print</button>
                <button type="button" class="btn btn-sm" id="btn-quiz" title="Quiz yourself">&#128300; Quiz</button>
                <span style="color:var(--c-text-muted);font-size:var(--text-sm)">&#128337; {reading_time} min read</span>
            </div>

            <div class="notes-page">
                <aside class="sidebar" id="toc-sidebar">
                    <h4 class="toc-header">
                        <span>Table of Contents</span>
                        <button type="button" class="toc-collapse-btn" id="toc-collapse-all" title="Collapse all">&#9660;</button>
                    </h4>
                    <ul id="toc-list"></ul>
                </aside>

                <article class="article-content" id="article-content">
                    {article_content}
                </article>
            </div>
        </div>
    </main>

    <!-- Quiz Modal -->
    <div class="modal" id="quiz-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Quiz Mode</h3>
                <button type="button" class="modal-close" id="quiz-close">&times;</button>
            </div>
            <div class="modal-body" id="quiz-body"></div>
        </div>
    </div>

    <script>document.write(LL.renderFooter());</script>
    <script src="../../assets/js/search.js" defer></script>
    <script src="../../assets/js/features.js" defer></script>
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
        document.addEventListener('DOMContentLoaded', function() {{ LL.init(); }});
    </script>
</body>
</html>'''

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    return True

# Patch all note files
count = 0
for filename in sorted(os.listdir(NOTES_DIR)):
    if filename.endswith('.html') and filename != 'index.html':
        filepath = os.path.join(NOTES_DIR, filename)
        print(f'Patching {filename}...', end=' ')
        if patch_note(filepath):
            count += 1
            print('OK')
        else:
            print('SKIPPED')

print(f'\nDone! Patched {count} note files.')
