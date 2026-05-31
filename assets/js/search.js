/**
 * Laurel Library — Search Module v2.0
 * Command palette style search with keyboard navigation
 */
(function() {
    'use strict';
    var LL = window.LL || {};
    var searchIndex = [];
    var activeIndex = -1;

    LL.search = {
        load: function() {
            var paths = ['search-index.json', '../search-index.json', '../../search-index.json',
                         'notes/index.json', '../notes/index.json', '../../notes/index.json'];
            
            function tryPath(i) {
                if (i >= paths.length) return;
                fetch(paths[i]).then(function(r) {
                    if (!r.ok) throw new Error();
                    return r.json();
                }).then(function(data) {
                    if (Array.isArray(data)) {
                        searchIndex = data;
                    } else if (data.notes) {
                        searchIndex = data.notes.map(function(n) {
                            return { title: n.title, path: n.path, category: n.category, keywords: n.exam || '' };
                        });
                    }
                }).catch(function() { tryPath(i + 1); });
            }
            tryPath(0);
        },

        perform: function(query) {
            var results = document.getElementById('search-results');
            if (!results) return;
            if (!query || query.length < 2) {
                results.innerHTML = '<div class="search-empty">Type to search notes, exams, and subjects...</div>';
                activeIndex = -1;
                return;
            }

            var terms = query.toLowerCase().split(/\s+/);
            var matches = [];

            searchIndex.forEach(function(item) {
                var text = (item.title + ' ' + item.category + ' ' + (item.keywords || '')).toLowerCase();
                var score = 0;
                terms.forEach(function(t) {
                    if (text.includes(t)) score++;
                    if (item.title.toLowerCase().includes(t)) score += 2;
                });
                if (score > 0) matches.push({ item: item, score: score });
            });

            matches.sort(function(a, b) { return b.score - a.score; });
            matches = matches.slice(0, 10);

            if (matches.length === 0) {
                results.innerHTML = '<div class="search-empty">No results found for "' + LL.escapeHtml(query) + '"</div>';
                activeIndex = -1;
                return;
            }

            var b = LL.basePath;
            results.innerHTML = matches.map(function(m, i) {
                var cat = (m.item.category || '').replace(/-/g, ' ');
                cat = cat.charAt(0).toUpperCase() + cat.slice(1);
                return '<a href="' + b + m.item.path + '?highlight=' + encodeURIComponent(query) + '" class="search-result-item' + (i === 0 ? ' active' : '') + '">' +
                    '<div class="result-icon">📄</div>' +
                    '<div class="result-text"><h4>' + LL.escapeHtml(m.item.title) + '</h4><p>' + LL.escapeHtml(cat) + '</p></div></a>';
            }).join('');
            activeIndex = 0;
        }
    };

    // Keyboard navigation in search
    document.addEventListener('keydown', function(e) {
        var results = document.getElementById('search-results');
        if (!results || !results.querySelector('.search-result-item')) return;
        var items = results.querySelectorAll('.search-result-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            items.forEach(function(el, i) { el.classList.toggle('active', i === activeIndex); });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            items.forEach(function(el, i) { el.classList.toggle('active', i === activeIndex); });
        } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
            e.preventDefault();
            window.location.href = items[activeIndex].href;
        }
    });

    window.LL = LL;
    document.addEventListener('DOMContentLoaded', function() { LL.search.load(); });
})();
