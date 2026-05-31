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
                if (text.length > 3 && text.length < 100 && parent) {
                    var context = parent.textContent.trim();
                    if (context.length > 20 && context.length < 500) facts.push({ term: text, context: context });
                }
            });
            article.querySelectorAll('li').forEach(function(li) {
                var text = li.textContent.trim();
                if (text.length > 15 && text.length < 200 && /\d/.test(text)) {
                    var parts = text.split(/[\u2013\u2014:\-]/);
                    facts.push({ term: parts[0].trim(), context: text });
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
                    '<button class="quiz-reveal btn btn-sm btn-primary" data-answer="' + LL.escapeHtml(fact.term).replace(/"/g,'&quot;') + '">Show Answer</button>' +
                    '<p class="quiz-answer hidden"><strong>Answer:</strong> ' + LL.escapeHtml(fact.term) + '</p></div>';
            });
            html += '<button class="quiz-regenerate" id="quiz-regenerate">Generate New Questions</button></div>';
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
})();
