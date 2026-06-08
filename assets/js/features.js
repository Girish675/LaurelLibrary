/**
 * Laurel Library — Features Module v2.0
 * Bookmarks, Quiz, TOC, Search highlighting, Reading progress
 */
(function() {
    'use strict';
    var LL = window.LL || {};

    // ===== Bookmark Button =====
    var bookmarkBtn = document.getElementById('btn-bookmark');
    if (bookmarkBtn) {
        var currentPath = window.location.pathname;
        function updateBookmarkUI() {
            var is = LL.bookmarks.has(currentPath);
            bookmarkBtn.classList.toggle('bookmarked', is);
            bookmarkBtn.innerHTML = LL.icons.bookmark + (is ? ' Saved' : ' Save');
        }
        bookmarkBtn.addEventListener('click', function() {
            if (LL.bookmarks.has(currentPath)) {
                LL.bookmarks.remove(currentPath);
                LL.toast('Bookmark removed', 'info');
            } else {
                var title = document.querySelector('.article-content h1');
                LL.bookmarks.add(currentPath, title ? title.textContent : document.title);
                LL.toast('Note bookmarked!', 'success');
            }
            updateBookmarkUI();
        });
        updateBookmarkUI();
    }

    // ===== Reading Progress =====
    var progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) {
        var article = document.getElementById('article-content');
        if (article) {
            var prog = document.createElement('div');
            prog.className = 'reading-progress';
            prog.innerHTML = '<div class="reading-progress-bar"></div>';
            document.body.appendChild(prog);
            progressBar = prog.querySelector('.reading-progress-bar');
        }
    }

    if (progressBar) {
        window.addEventListener('scroll', function() {
            var doc = document.documentElement;
            var scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) * 100;
            progressBar.style.width = Math.min(scrolled, 100) + '%';
        });
    }

    // ===== TOC Cleanup: remove dead toggles on sections with no sub-items =====
    // Runs after the inline TOC builder has finished so dead arrows are removed.
    function cleanupToc() {
        var tocList = document.getElementById('toc-list');
        if (!tocList) return;
        tocList.querySelectorAll('.toc-parent').forEach(function(li) {
            var children = li.querySelector('.toc-children');
            var toggle = li.querySelector('.toc-toggle');
            if (!children || children.children.length === 0) {
                if (toggle) toggle.remove();
                if (children) children.remove();
                li.classList.remove('toc-parent');
            }
        });
        // "Collapse all" should only show when at least one collapsible section exists
        var collapseBtn = document.getElementById('toc-collapse-all');
        if (collapseBtn && tocList.querySelectorAll('.toc-children').length === 0) {
            collapseBtn.style.display = 'none';
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanupToc);
    } else {
        cleanupToc();
    }

    // ===== TOC Active Tracking =====
    var tocLinks = document.querySelectorAll('#toc-list a');
    if (tocLinks.length > 0) {
        var headings = [];
        tocLinks.forEach(function(link) {
            var id = link.getAttribute('href');
            if (!id) return;
            var el = document.getElementById(id.substring(1));
            if (el) headings.push({ el: el, link: link });
        });
        function updateActiveTOC() {
            var active = null;
            for (var i = headings.length - 1; i >= 0; i--) {
                if (headings[i].el.getBoundingClientRect().top <= 120) { active = headings[i]; break; }
            }
            tocLinks.forEach(function(l) { l.classList.remove('active'); });
            if (active) active.link.classList.add('active');
        }
        window.addEventListener('scroll', updateActiveTOC);
        updateActiveTOC();
    }

    // ===== Search Highlighting =====
    (function() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || params.get('highlight');
        if (!query) return;
        var article = document.getElementById('article-content');
        if (!article) return;
        var terms = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 2; });
        if (terms.length === 0) return;
        function highlightNode(node) {
            if (node.nodeType === 3) {
                var text = node.textContent, lower = text.toLowerCase(), found = false;
                for (var i = 0; i < terms.length; i++) { if (lower.indexOf(terms[i]) !== -1) { found = true; break; } }
                if (!found) return;
                var frag = document.createDocumentFragment(), remaining = text;
                while (remaining.length > 0) {
                    var bestIdx = remaining.length, bestTerm = '';
                    for (var j = 0; j < terms.length; j++) {
                        var idx = remaining.toLowerCase().indexOf(terms[j]);
                        if (idx !== -1 && idx < bestIdx) { bestIdx = idx; bestTerm = terms[j]; }
                    }
                    if (bestTerm === '') { frag.appendChild(document.createTextNode(remaining)); break; }
                    if (bestIdx > 0) frag.appendChild(document.createTextNode(remaining.substring(0, bestIdx)));
                    var mark = document.createElement('mark');
                    mark.className = 'search-highlight';
                    mark.textContent = remaining.substring(bestIdx, bestIdx + bestTerm.length);
                    frag.appendChild(mark);
                    remaining = remaining.substring(bestIdx + bestTerm.length);
                }
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === 1 && !['SCRIPT','STYLE','MARK'].includes(node.tagName)) {
                Array.from(node.childNodes).forEach(highlightNode);
            }
        }
        highlightNode(article);
        var first = article.querySelector('.search-highlight');
        if (first) setTimeout(function() { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
    })();

    // ===== Quiz Mode =====
    var quizBtn = document.getElementById('btn-quiz');
    var quizModal = document.getElementById('quiz-modal');
    var quizClose = document.getElementById('quiz-close');
    var quizBody = document.getElementById('quiz-body');

    if (quizBtn && quizModal) {
        function extractFacts() {
            var article = document.getElementById('article-content');
            if (!article) return [];
            var facts = [];
            article.querySelectorAll('strong').forEach(function(el) {
                var text = el.textContent.trim(), parent = el.parentElement;
                if (text.length > 3 && text.length < 100 && parent && !/[∫∑√±≠≈≤≥∞∂∇×÷∈∉⊂∪∩⊕⊗]/.test(text)) {
                    var context = parent.textContent.trim();
                    if (context.length > 20 && context.length < 500 && !/[∫∑√±≠≈≤≥∞∂∇×÷]/.test(context)) facts.push({ term: text, context: context });
                }
            });
            article.querySelectorAll('li').forEach(function(li) {
                var text = li.textContent.trim();
                if (text.length > 15 && text.length < 200 && /\d/.test(text) && !/[∫∑√±≠≈≤≥∞∂∇×÷∈∉⊂∪∩⊕⊗]/.test(text)) {
                    var parts = text.split(/[\u2013\u2014:\-]/);
                    if (parts.length > 1 && parts[0].trim().length > 3) {
                        facts.push({ term: parts[0].trim(), context: text });
                    }
                }
            });
            return facts;
        }

        function generateQuiz() {
            var facts = extractFacts();
            if (facts.length < 3) {
                quizBody.innerHTML = '<div class="quiz-empty">Not enough content to generate a quiz.</div>';
                return;
            }
            var selected = [], pool = facts.slice();
            for (var i = 0; i < Math.min(5, pool.length); i++) {
                var idx = Math.floor(Math.random() * pool.length);
                selected.push(pool.splice(idx, 1)[0]);
            }
            var html = '<div class="quiz-questions">';
            selected.forEach(function(fact, qIdx) {
                var question = fact.context.replace(fact.term, '<span class="quiz-blank">______</span>');
                html += '<div class="quiz-question"><p class="quiz-q"><strong>Q' + (qIdx+1) + '.</strong> ' + question + '</p>' +
                    '<button type="button" class="quiz-reveal btn btn-sm btn-primary" data-answer="' + LL.escapeHtml(fact.term).replace(/"/g,'&quot;') + '">Show Answer</button>' +
                    '<p class="quiz-answer hidden"><strong>Answer:</strong> ' + LL.escapeHtml(fact.term) + '</p></div>';
            });
            html += '<button type="button" class="quiz-regenerate" id="quiz-regenerate">Generate New Questions</button></div>';
            quizBody.innerHTML = html;
            quizBody.querySelectorAll('.quiz-reveal').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    btn.nextElementSibling.classList.remove('hidden');
                    btn.style.display = 'none';
                    LL.xp.add(3, 'Answered a quiz question');
                });
            });
            var regen = document.getElementById('quiz-regenerate');
            if (regen) regen.addEventListener('click', generateQuiz);
        }

        quizBtn.addEventListener('click', function() {
            generateQuiz();
            quizModal.classList.add('active');
        });
        quizClose.addEventListener('click', function() { quizModal.classList.remove('active'); });
        quizModal.addEventListener('click', function(e) { if (e.target === quizModal) quizModal.classList.remove('active'); });
    }

    // ===== Print =====
    var printBtn = document.getElementById('btn-print');
    if (printBtn) {
        printBtn.addEventListener('click', function() { window.print(); });
    }

    // ===== Track study time for article pages =====
    if (document.getElementById('article-content')) {
        var startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            var mins = Math.round((Date.now() - startTime) / 60000);
            if (mins > 0) LL.tracker.log(mins);
        });
        // XP for reading
        setTimeout(function() { LL.xp.add(5, 'Reading a note'); }, 30000);
    }

    // ===== Related Notes =====
    (function() {
        var article = document.getElementById('article-content');
        if (!article) return;
        var path = window.location.pathname;
        var marker = '/notes/';
        var idx = path.indexOf(marker);
        if (idx === -1) return;
        var rest = path.substring(idx + marker.length); // e.g. "geography/01-foo.html"
        var segments = rest.split('/');
        if (segments.length < 2) return;
        var category = segments[0];
        var currentFile = segments[segments.length - 1];

        fetch(LL.basePath + 'notes/index.json').then(function(r) {
            return r.ok ? r.json() : null;
        }).then(function(data) {
            if (!data || !data.notes) return;
            var related = data.notes.filter(function(n) {
                return n.category === category && n.path.split('/').pop() !== currentFile;
            }).slice(0, 4);
            if (related.length === 0) return;

            var section = document.createElement('section');
            section.className = 'related-notes';
            section.innerHTML = '<h2>Related Notes</h2><div class="related-grid">' +
                related.map(function(n, idx) {
                    var mins = n.reading_time ? n.reading_time + ' min read' : '';
                    var title = n.title;
                    var badge = '';
                    var match = title.match(/^0*(\d+)\s+(.+)$/);
                    if (match) {
                        badge = '<div style="font-size:var(--text-xs);color:var(--c-accent);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Unit ' + match[1] + '</div>';
                        title = match[2];
                    } else {
                        badge = '<div style="font-size:var(--text-xs);color:var(--c-accent);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Unit ' + (idx + 1) + '</div>';
                    }
                    return '<a href="' + LL.basePath + n.path + '" class="note-card" style="display:flex;flex-direction:column;justify-content:space-between">' +
                        '<div>' + badge + '<h4 style="margin-top:0">' + LL.escapeHtml(title) + '</h4></div>' +
                        '<div class="meta" style="margin-top:var(--space-sm)"><span class="tag">' + LL.escapeHtml((n.exam || 'General').split(',')[0]) + '</span>' +
                        (mins ? '<span>' + mins + '</span>' : '') + '</div></a>';
                }).join('') + '</div>';
            article.parentNode.appendChild(section);
        }).catch(function() {});
    })();
})();
