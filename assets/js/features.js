/**
 * Laurel Library - Features Module
 * Dark mode, Bookmarks, Reading progress, Study tracker
 */

(function () {
    'use strict';

    // ===== Dark Mode =====
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('ll-theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ll-theme', theme);
    }

    // Apply saved theme on load
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ===== Bookmarks =====
    const bookmarkBtn = document.getElementById('btn-bookmark');
    if (bookmarkBtn) {
        const currentPath = window.location.pathname;
        const bookmarks = JSON.parse(localStorage.getItem('ll-bookmarks') || '[]');

        function isBookmarked() {
            return bookmarks.some(b => b.path === currentPath);
        }

        function updateBookmarkUI() {
            if (isBookmarked()) {
                bookmarkBtn.classList.add('bookmarked');
                bookmarkBtn.querySelector('.bookmark-icon').textContent = '★';
            } else {
                bookmarkBtn.classList.remove('bookmarked');
                bookmarkBtn.querySelector('.bookmark-icon').textContent = '☆';
            }
        }

        bookmarkBtn.addEventListener('click', function () {
            if (isBookmarked()) {
                const idx = bookmarks.findIndex(b => b.path === currentPath);
                bookmarks.splice(idx, 1);
            } else {
                const title = document.querySelector('.article-content h1');
                bookmarks.push({
                    path: currentPath,
                    title: title ? title.textContent : document.title,
                    date: new Date().toISOString()
                });
            }
            localStorage.setItem('ll-bookmarks', JSON.stringify(bookmarks));
            updateBookmarkUI();
        });

        updateBookmarkUI();
    }

    // ===== Reading Progress =====
    const progressEl = document.getElementById('reading-progress');
    const article = document.getElementById('article-content');

    if (progressEl && article) {
        function updateProgress() {
            const rect = article.getBoundingClientRect();
            const articleTop = rect.top + window.scrollY;
            const articleHeight = rect.height;
            const scrolled = window.scrollY - articleTop + window.innerHeight;
            const progress = Math.min(100, Math.max(0, Math.round((scrolled / articleHeight) * 100)));
            progressEl.textContent = progress + '% read';

            // Mark as read when reaching 90%
            if (progress >= 90) {
                markAsRead();
            }
        }

        function markAsRead() {
            const currentPath = window.location.pathname;
            const readNotes = JSON.parse(localStorage.getItem('ll-read') || '[]');
            if (!readNotes.includes(currentPath)) {
                readNotes.push(currentPath);
                localStorage.setItem('ll-read', JSON.stringify(readNotes));
            }
        }

        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    // ===== TOC Active Tracking =====
    const tocLinks = document.querySelectorAll('#toc-list a');
    if (tocLinks.length > 0) {
        const headings = [];
        tocLinks.forEach(function (link) {
            const id = link.getAttribute('href').substring(1);
            const el = document.getElementById(id);
            if (el) headings.push({ el: el, link: link });
        });

        function updateActiveTOC() {
            let active = null;
            for (let i = headings.length - 1; i >= 0; i--) {
                const rect = headings[i].el.getBoundingClientRect();
                if (rect.top <= 100) {
                    active = headings[i];
                    break;
                }
            }
            tocLinks.forEach(l => l.classList.remove('active'));
            if (active) {
                active.link.classList.add('active');
            }
        }

        window.addEventListener('scroll', updateActiveTOC);
        updateActiveTOC();
    }
})();
