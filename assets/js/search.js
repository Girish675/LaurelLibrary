// Client-side search using Fuse.js (lightweight fuzzy search)
// We load the search index and use a simple implementation

let searchIndex = [];
let searchTimeout = null;

async function loadSearchIndex() {
    // Try multiple paths to find search-index.json from any page depth
    const paths = ['search-index.json', '../search-index.json', '../../search-index.json'];
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                searchIndex = await response.json();
                return;
            }
        } catch (e) {
            continue;
        }
    }
}

function performSearch(query) {
    if (!query || query.length < 2) return [];

    const terms = query.toLowerCase().split(/\s+/);
    const results = [];

    searchIndex.forEach(item => {
        const text = `${item.title} ${item.category} ${item.keywords || ''}`.toLowerCase();
        let score = 0;
        terms.forEach(term => {
            if (text.includes(term)) score++;
        });
        if (score > 0) {
            results.push({ ...item, score });
        }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
}

function renderSearchResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
        container.classList.remove('active');
        return;
    }

    // Determine base path to root
    const depth = (window.location.pathname.match(/\//g) || []).length;
    let basePath = '';
    const currentPath = window.location.pathname;
    if (currentPath.includes('/notes/') && currentPath.split('/notes/')[1].includes('/')) {
        basePath = '../../';
    } else if (currentPath.includes('/notes/') || currentPath.includes('/exams/')) {
        basePath = '../';
    }

    container.innerHTML = results.map(r => {
        const query = document.getElementById('search-input') ? document.getElementById('search-input').value : '';
        const separator = r.path.includes('?') ? '&' : '?';
        const href = query ? `${basePath}${r.path}${separator}highlight=${encodeURIComponent(query)}` : `${basePath}${r.path}`;
        return `<a href="${href}">
            <strong>${r.title}</strong>
            <br><small>${r.category}</small>
        </a>`;
    }).join('');
    container.classList.add('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadSearchIndex();

    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const results = performSearch(e.target.value);
            renderSearchResults(results);
        }, 200);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            const container = document.getElementById('search-results');
            if (container) container.classList.remove('active');
        }, 200);
    });

    input.addEventListener('focus', (e) => {
        if (e.target.value.length >= 2) {
            const results = performSearch(e.target.value);
            renderSearchResults(results);
        }
    });
});
