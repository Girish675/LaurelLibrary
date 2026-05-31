/**
 * Laurel Library — Shared Components v2.0
 * Renders header, footer, search modal, and initializes shared features
 */
const LL = window.LL || {};

/* ===== SVG Icons ===== */
LL.icons = {
    search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    bookmark: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    fire: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    printer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>'
};

/* ===== Utility ===== */
LL.escapeHtml = function(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
};

LL.basePath = (function() {
    var p = window.location.pathname;
    if (p.includes('/notes/') && p.split('/notes/')[1].includes('/')) return '../../';
    if (p.includes('/notes/') || p.includes('/exams/') || p.includes('/tools/') || p.includes('/subjects/') || p.includes('/resources/')) return '../';
    return '';
})();

/* ===== Render Header ===== */
LL.renderHeader = function(activePage) {
    var b = LL.basePath;
    var nav = [
        { id: 'home', label: 'Home', href: b + 'index.html' },
        { id: 'notes', label: 'Notes', href: b + 'notes/index.html' },
        { id: 'exams', label: 'Exams', href: b + 'exams/index.html' },
        { id: 'subjects', label: 'Subjects', href: b + 'subjects/index.html' },
        { id: 'tools', label: 'Tools', href: b + 'tools/index.html' },
        { id: 'resources', label: 'Resources', href: b + 'resources/index.html' }
    ];

    var navLinks = nav.map(function(n) {
        var cls = n.id === activePage ? ' class="active" aria-current="page"' : '';
        return '<a href="' + n.href + '"' + cls + '>' + n.label + '</a>';
    }).join('');

    return '<a href="#main-content" class="skip-link">Skip to content</a>' +
        '<header class="site-header" role="banner"><div class="container header-inner">' +
        '<div class="logo"><a href="' + b + 'index.html"><div class="logo-icon"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4c-3 2-5 5-5 9 0 3 1 5 3 7-2-1-4-3-5-6-1 4 1 8 4 10-2 0-4-1-5-3 0 3 2 6 5 7h6c3-1 5-4 5-7-1 2-3 3-5 3 3-2 5-6 4-10-1 3-3 5-5 6 2-2 3-4 3-7 0-4-2-7-5-9z" fill="currentColor"/></svg></div><span class="logo-text">LAUREL<span class="logo-text-lib">LIBRARY</span></span></a></div>' +
        '<nav class="main-nav" role="navigation" aria-label="Main navigation" id="main-nav">' + navLinks + '</nav>' +
        '<div class="header-actions">' +
        '<button type="button" class="search-trigger" id="search-trigger" aria-label="Search">' + LL.icons.search + '<span>Search...</span><span class="shortcut">Ctrl+K</span></button>' +
        '<button type="button" class="theme-toggle" id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="icon-moon">' + LL.icons.moon + '</span><span class="icon-sun">' + LL.icons.sun + '</span></button>' +
        '<button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">' + LL.icons.menu + '</button>' +
        '</div></div></header>';
};

/* ===== Render Footer ===== */
LL.renderFooter = function() {
    var b = LL.basePath;
    return '<footer class="site-footer" role="contentinfo"><div class="container">' +
        '<div class="footer-grid">' +
        '<div class="footer-brand"><span class="logo-text">🏛️ LAUREL LIBRARY</span><p>Your Success, Our Mission. Free study notes and tools for competitive exam aspirants in India.</p></div>' +
        '<div class="footer-column"><h4>Platform</h4>' +
        '<a href="' + b + 'notes/index.html">Notes</a>' +
        '<a href="' + b + 'exams/index.html">Exams</a>' +
        '<a href="' + b + 'subjects/index.html">Subjects</a>' +
        '<a href="' + b + 'tools/index.html">Tools</a>' +
        '<a href="' + b + 'resources/index.html">Resources</a></div>' +
        '<div class="footer-column"><h4>Tools</h4>' +
        '<a href="' + b + 'tools/pomodoro.html">Pomodoro Timer</a>' +
        '<a href="' + b + 'tools/gpa-calculator.html">GPA Calculator</a>' +
        '<a href="' + b + 'tools/flashcards.html">Flashcards</a>' +
        '<a href="' + b + 'tools/planner.html">Study Planner</a></div>' +
        '<div class="footer-column"><h4>About</h4>' +
        '<a href="' + b + 'about.html">About Us</a>' +
        '<a href="' + b + 'dashboard.html">Dashboard</a>' +
        '<a href="https://github.com/Girish675/LaurelLibrary" target="_blank" rel="noopener noreferrer">GitHub</a></div>' +
        '</div>' +
        '<div class="footer-bottom"><span>&copy; 2026 Laurel Library. Free for all.</span><span>Made with ❤️ for students</span></div>' +
        '</div></footer>';
};

/* ===== Render Search Modal ===== */
LL.renderSearchModal = function() {
    return '<div class="search-modal-overlay" id="search-overlay">' +
        '<div class="search-modal" role="dialog" aria-label="Search">' +
        '<div class="search-modal-input">' + LL.icons.search +
        '<input type="text" id="search-input" placeholder="Search notes, exams, subjects..." autocomplete="off" aria-label="Search">' +
        '</div>' +
        '<div class="search-results-list" id="search-results"></div>' +
        '<div class="search-footer"><span><kbd>↵</kbd> to select</span><span><kbd>↑↓</kbd> to navigate</span><span><kbd>Esc</kbd> to close</span></div>' +
        '</div></div>';
};

/* ===== Toast ===== */
LL.toast = function(message, type) {
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    var icons = { success: '✓', warning: '⚠', error: '✗', info: 'ℹ' };
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>' + (icons[type] || icons.info) + '</span><span>' + LL.escapeHtml(message) + '</span>';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
};

/* ===== XP / Gamification System ===== */
LL.xp = {
    get: function() { return parseInt(localStorage.getItem('ll-xp') || '0', 10); },
    add: function(amount, reason) {
        var current = LL.xp.get();
        localStorage.setItem('ll-xp', current + amount);
        if (reason) LL.toast('+' + amount + ' XP — ' + reason, 'success');
    },
    level: function() { return Math.floor(LL.xp.get() / 100) + 1; },
    progress: function() { return (LL.xp.get() % 100); }
};

/* ===== Streak System ===== */
LL.streak = {
    check: function() {
        var today = new Date().toDateString();
        var last = localStorage.getItem('ll-last-visit');
        var streak = parseInt(localStorage.getItem('ll-streak') || '0', 10);
        if (last === today) return streak;
        var yesterday = new Date(Date.now() - 86400000).toDateString();
        if (last === yesterday) {
            streak++;
            LL.xp.add(5, 'Daily streak (' + streak + ' days)');
        } else if (last !== today) {
            streak = 1;
        }
        localStorage.setItem('ll-streak', streak);
        localStorage.setItem('ll-last-visit', today);
        return streak;
    },
    get: function() { return parseInt(localStorage.getItem('ll-streak') || '0', 10); }
};

/* ===== Study Tracker ===== */
LL.tracker = {
    log: function(minutes) {
        var today = new Date().toISOString().split('T')[0];
        var data = JSON.parse(localStorage.getItem('ll-study-log') || '{}');
        data[today] = (data[today] || 0) + minutes;
        localStorage.setItem('ll-study-log', JSON.stringify(data));
    },
    getToday: function() {
        var today = new Date().toISOString().split('T')[0];
        var data = JSON.parse(localStorage.getItem('ll-study-log') || '{}');
        return data[today] || 0;
    },
    getHistory: function(days) {
        var data = JSON.parse(localStorage.getItem('ll-study-log') || '{}');
        var result = [];
        for (var i = days - 1; i >= 0; i--) {
            var d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
            result.push({ date: d, minutes: data[d] || 0 });
        }
        return result;
    }
};

/* ===== Bookmarks ===== */
LL.bookmarks = {
    getAll: function() { return JSON.parse(localStorage.getItem('ll-bookmarks') || '[]'); },
    add: function(path, title) {
        var bm = LL.bookmarks.getAll();
        if (!bm.some(function(b) { return b.path === path; })) {
            bm.push({ path: path, title: title, date: new Date().toISOString() });
            localStorage.setItem('ll-bookmarks', JSON.stringify(bm));
            LL.xp.add(2, 'Bookmarked a note');
        }
    },
    remove: function(path) {
        var bm = LL.bookmarks.getAll().filter(function(b) { return b.path !== path; });
        localStorage.setItem('ll-bookmarks', JSON.stringify(bm));
    },
    has: function(path) {
        return LL.bookmarks.getAll().some(function(b) { return b.path === path; });
    }
};

/* ===== Initialize Core ===== */
LL.init = function() {
    // Theme
    var saved = localStorage.getItem('ll-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('ll-theme', next);
        });
    }

    // Mobile menu
    var menuBtn = document.getElementById('mobile-menu-btn');
    var nav = document.getElementById('main-nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('open');
            var isOpen = nav.classList.contains('open');
            menuBtn.innerHTML = isOpen ? LL.icons.x : LL.icons.menu;
            menuBtn.setAttribute('aria-expanded', isOpen);
        });
    }

    // Search modal
    var searchTrigger = document.getElementById('search-trigger');
    var searchOverlay = document.getElementById('search-overlay');
    var searchInput = document.getElementById('search-input');

    function openSearch() {
        if (searchOverlay) {
            searchOverlay.classList.add('active');
            if (searchInput) searchInput.focus();
        }
    }
    function closeSearch() {
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            if (searchInput) searchInput.value = '';
            var results = document.getElementById('search-results');
            if (results) results.innerHTML = '';
        }
    }

    if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) closeSearch();
        });
    }

    // Ctrl+K shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') closeSearch();
    });

    // Search functionality
    if (searchInput) {
        var searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                LL.search.perform(searchInput.value);
            }, 200);
        });
    }

    // Streak
    LL.streak.check();

    // Track page view for study time
    LL.tracker.log(1);

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(LL.basePath + 'sw.js').catch(function() {});
    }
};

window.LL = LL;
