import os
import glob
import re
import argparse

def verify_notes(notes_dir):
    html_files = glob.glob(os.path.join(notes_dir, "**/*.html"), recursive=True)
    if not html_files:
        print(f"No HTML files found in {notes_dir}")
        return

    total_images = 0
    total_equations = 0
    total_words = 0
    issues = []

    for html_file in html_files:
        if 'index.html' in html_file:
            continue
            
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Strip HTML tags for text analysis
        text = re.sub(r'<[^>]+>', ' ', content)
        words = len(text.split())
        total_words += words
        if words < 100:
            issues.append(f"Warning: Very low word count ({words}) in {html_file}")
            
        # Images
        images = len(re.findall(r'<img\s', content))
        total_images += images
        
        # Detect broken math logic
        math_symbols = sum(1 for c in text if c in '∫∑√±≠≈≤≥∞∂∇×÷∈∉⊂∪∩⊕⊗')
        if math_symbols > 15:
            issues.append(f"Warning: High math symbol count ({math_symbols}) in {html_file}. Equation heuristic might be missing blocks.")
            
        # Detect watermarks left in text
        watermarks = ['testbook', 'pass pro max', 'made easy', 'gate academy']
        text_lower = text.lower()
        for wm in watermarks:
            if wm in text_lower:
                issues.append(f"Warning: Watermark '{wm}' detected in text of {html_file}")
                
        # Check title formatting
        if '<h1' not in content:
            issues.append(f"Warning: Missing h1 title in {html_file}")
            
    print(f"--- Verification Results for {notes_dir} ---")
    print(f"Total HTML files audited: {len(html_files)}")
    print(f"Total Words extracted: {total_words}")
    print(f"Total Images extracted: {total_images}")
    print(f"--- Issues Detected ({len(issues)}) ---\n")
    for issue in issues:
        print(issue)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify generated HTML notes.")
    parser.add_argument("directory", help="Directory to audit (e.g. notes/analog-electronics)")
    args = parser.parse_args()
    verify_notes(args.directory)
