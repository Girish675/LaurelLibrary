# LaurelLibrary

Your centralized digital library for competitive exam notes. Streamline your preparation, organize study materials, and claim your laurels.

**Live Site:** https://girish675.github.io/LaurelLibrary/

## Supported Exams

SSC, UPSC, GATE, IIT-JEE, NEET, Banking, Railways & more.

## Setup (Local Development)

### Prerequisites
- Python 3.10+ with `pip`
- Git

### Install Dependencies

```bash
py -m pip install PyMuPDF Pillow
```

### Preview Locally

```bash
py -m http.server 8000
```

Open http://localhost:8000 in your browser.

## Adding New PDFs

### Single File

```bash
py scripts/convert_pdf.py "YourFile.pdf" -c <category> -t "Title" -e "UPSC, SSC"
```

### Batch Convert (Entire Folder)

```bash
py scripts/convert_pdf.py ./pdfs/ -c <category> -e "UPSC, SSC"
```

### Available Categories

`geography`, `history`, `polity`, `economics`, `science`, `mathematics`, `english`, `reasoning`, `current-affairs`, `general-knowledge`

### Options

| Flag | Description | Example |
|------|-------------|---------|
| `-c` | Category (required) | `-c geography` |
| `-t` | Title (auto-detected from filename if omitted) | `-t "India: Rivers"` |
| `-e` | Target exam | `-e "UPSC, SSC"` |
| `-o` | Output base directory (defaults to project root) | `-o ./` |

## Deploying to GitHub Pages

### First-Time Setup

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add notes"
   git push origin main
   ```

2. Go to your GitHub repo → **Settings** → **Pages**

3. Under **Source**, select **GitHub Actions**

4. The site auto-deploys on every push to `main`

### Updating the Site

After adding new PDFs and converting them:

```bash
git add .
git commit -m "Add new notes"
git push
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically rebuild and deploy.

## Project Structure

```
LaurelLibrary/
├── index.html              # Homepage
├── about.html              # About page
├── search-index.json       # Search data (auto-updated)
├── assets/
│   ├── css/style.css       # Site theme
│   └── js/                 # Search & app logic
├── notes/
│   ├── index.html          # All notes listing
│   ├── index.json          # Notes registry (auto-updated)
│   └── geography/          # Category folder
│       ├── index.html      # Category listing
│       └── *.html          # Converted notes
├── scripts/
│   ├── convert_pdf.py      # PDF converter
│   └── requirements.txt    # Python dependencies
└── .github/workflows/
    └── deploy.yml          # GitHub Pages auto-deploy
```

## License

See [LICENSE](LICENSE) file.
