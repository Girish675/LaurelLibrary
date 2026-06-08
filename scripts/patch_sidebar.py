"""
Patch all existing note HTML files to use the new sidebar toggle system.

Fixes:
1. Old geography notes: missing sidebar-toggle button, missing id="notes-page"
2. All notes: replace old inline-style sidebar JS with CSS class toggle
3. Old modal structure: update to modal-overlay
"""

import os
import re
import glob

NOTES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "notes")

# New TOC header with sidebar toggle button
NEW_TOC_HEADER = '''                    <h4 class="toc-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <button type="button" id="sidebar-toggle" title="Toggle Sidebar">&#9776;</button>
                            <span id="toc-title-text">Table of Contents</span>
                        </span>
                        <button type="button" class="toc-collapse-btn" id="toc-collapse-all" title="Collapse all">&#9660;</button>
                    </h4>'''

# New sidebar toggle JS (CSS class based)
NEW_SIDEBAR_JS = '''            // Sidebar toggle
            var sidebarToggle = document.getElementById('sidebar-toggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    var notesPage = document.getElementById('notes-page');
                    notesPage.classList.toggle('sidebar-collapsed');
                });
            }'''


def patch_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    changes = []

    # 1. Fix notes-page div: add id if missing
    if 'class="notes-page"' in content and 'id="notes-page"' not in content:
        content = content.replace(
            'class="notes-page"',
            'class="notes-page" id="notes-page"'
        )
        changes.append("Added id='notes-page'")

    # 2. Fix TOC header: replace old header with new one that has sidebar-toggle
    if 'id="sidebar-toggle"' not in content:
        # Old geography-style header
        old_header_pattern = r'<h4 class="toc-header">\s*<span>Table of Contents</span>\s*<button[^>]*id="toc-collapse-all"[^>]*>[^<]*</button>\s*</h4>'
        if re.search(old_header_pattern, content, re.DOTALL):
            content = re.sub(old_header_pattern, NEW_TOC_HEADER, content, flags=re.DOTALL)
            changes.append("Replaced old TOC header with sidebar toggle")
    
    # 3. Fix TOC header: if it has old inline styles on sidebar-toggle, standardize
    if 'id="sidebar-toggle" style=' in content:
        content = re.sub(
            r'<button type="button" id="sidebar-toggle" style="[^"]*"[^>]*>[^<]*</button>',
            '<button type="button" id="sidebar-toggle" title="Toggle Sidebar">&#9776;</button>',
            content
        )
        changes.append("Removed inline styles from sidebar-toggle")

    # 4. Replace old inline-style sidebar toggle JS with CSS class toggle
    old_js_pattern = r'// Sidebar toggle\s*\n\s*var sidebarToggle = document\.getElementById\(\'sidebar-toggle\'\);\s*\n\s*if \(sidebarToggle\) \{\s*\n\s*(?:var sidebarCollapsed = false;\s*\n\s*)?sidebarToggle\.addEventListener\(\'click\', function\(\) \{\s*\n.*?(?:notesPage\.classList\.toggle|notesPage\.style\.gridTemplateColumns).*?\n\s*\}\);\s*\n\s*\}'
    if re.search(old_js_pattern, content, re.DOTALL):
        content = re.sub(old_js_pattern, NEW_SIDEBAR_JS, content, flags=re.DOTALL)
        changes.append("Updated sidebar toggle JS to CSS class-based")
    elif '// Sidebar toggle' not in content and 'sidebar-toggle' in content:
        # Has the button but missing the JS handler - add it before the closing })();
        content = content.replace(
            "        })();\n        document.addEventListener('DOMContentLoaded'",
            NEW_SIDEBAR_JS + "\n        })();\n        document.addEventListener('DOMContentLoaded'"
        )
        changes.append("Added sidebar toggle JS handler")
    elif 'sidebar-toggle' not in content:
        # No sidebar toggle at all - this is the geography case after header fix
        # JS needs to be added too
        close_pattern = r"(\s*\}\);\s*\}\s*\n\s*\}\)(?:\(\)|;)\(\);\s*\n)"
        pass  # We already added button and JS should be injected

    # 5. Fix old modal structure (geography notes use <div class="modal"> directly)
    if '<div class="modal" id="quiz-modal">' in content and '<div class="modal-overlay"' not in content:
        content = content.replace(
            '<div class="modal" id="quiz-modal">',
            '<div class="modal-overlay" id="quiz-modal">\n        <div class="modal">'
        )
        # Also need to add the closing div
        content = content.replace(
            '            <div class="modal-body" id="quiz-body"></div>\n        </div>\n    </div>',
            '            <div class="modal-body" id="quiz-body"></div>\n            </div>\n        </div>\n    </div>'
        )
        changes.append("Updated modal to modal-overlay structure")
    
    # 6. Fix old modal with <div class="modal-content">
    if '<div class="modal-content">' in content:
        content = content.replace('<div class="modal-content">', '')
        # Remove the extra closing div
        # Find the quiz modal section and clean up
        changes.append("Removed obsolete modal-content wrapper")

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return changes
    return []


def main():
    html_files = glob.glob(os.path.join(NOTES_DIR, "**", "*.html"), recursive=True)
    # Skip index.html files
    html_files = [f for f in html_files if os.path.basename(f) != "index.html"]
    
    print(f"Found {len(html_files)} note HTML files to patch")
    patched = 0
    
    for filepath in sorted(html_files):
        rel = os.path.relpath(filepath, NOTES_DIR)
        changes = patch_file(filepath)
        if changes:
            patched += 1
            print(f"  ✓ {rel}: {', '.join(changes)}")
    
    print(f"\nDone! Patched {patched}/{len(html_files)} files")


if __name__ == "__main__":
    main()
