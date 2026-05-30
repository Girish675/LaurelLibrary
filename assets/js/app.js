// Site data - categories and notes index
const siteData = {
    categories: [
        { id: "geography", name: "Geography", icon: "🌍", count: 0 },
        { id: "history", name: "History", icon: "📜", count: 0 },
        { id: "polity", name: "Polity", icon: "⚖️", count: 0 },
        { id: "economics", name: "Economics", icon: "📊", count: 0 },
        { id: "science", name: "Science", icon: "🔬", count: 0 },
        { id: "mathematics", name: "Mathematics", icon: "📐", count: 0 },
        { id: "english", name: "English", icon: "📝", count: 0 },
        { id: "reasoning", name: "Reasoning", icon: "🧩", count: 0 },
        { id: "current-affairs", name: "Current Affairs", icon: "📰", count: 0 },
        { id: "general-knowledge", name: "General Knowledge", icon: "💡", count: 0 }
    ],
    notes: []
};

// Load notes index
async function loadNotesIndex() {
    try {
        const response = await fetch('notes/index.json');
        if (response.ok) {
            const data = await response.json();
            siteData.notes = data.notes || [];
            // Update category counts
            siteData.notes.forEach(note => {
                const cat = siteData.categories.find(c => c.id === note.category);
                if (cat) cat.count++;
            });
        }
    } catch (e) {
        // Index not available yet
    }
    renderPage();
}

function renderPage() {
    renderCategories();
    renderRecentNotes();
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    grid.innerHTML = siteData.categories
        .filter(cat => cat.count > 0 || true) // Show all categories
        .map(cat => `
            <a href="notes/${cat.id}/index.html" class="category-card">
                <div class="icon">${cat.icon}</div>
                <h4>${cat.name}</h4>
                <p>${cat.count} ${cat.count === 1 ? 'note' : 'notes'}</p>
            </a>
        `).join('');
}

function renderRecentNotes() {
    const list = document.getElementById('recent-notes');
    if (!list) return;

    if (siteData.notes.length === 0) {
        list.innerHTML = '<p style="color: var(--color-text-light); grid-column: 1/-1;">Notes are being added. Check back soon!</p>';
        return;
    }

    const recent = siteData.notes.slice(0, 6);
    list.innerHTML = recent.map(note => `
        <a href="${note.path}" class="note-card">
            <h4>${note.title}</h4>
            <div class="meta">${getCategoryName(note.category)} &bull; ${note.exam || 'General'}</div>
        </a>
    `).join('');
}

function getCategoryName(id) {
    const cat = siteData.categories.find(c => c.id === id);
    return cat ? cat.name : id;
}

// Initialize
document.addEventListener('DOMContentLoaded', loadNotesIndex);
