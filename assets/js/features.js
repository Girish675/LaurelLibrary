/**
 * Laurel Library - Features Module v1.1
 * Dark mode, Bookmarks, Quiz, Flashcards, TOC tracking, Search highlighting
 */

(function () {
    'use strict';

    // ===== Dark Mode =====
    var themeToggle = document.getElementById('theme-toggle');
    var savedTheme = localStorage.getItem('ll-theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ll-theme', theme);
    }

    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ===== Bookmarks =====
    var bookmarkBtn = document.getElementById('btn-bookmark');
    if (bookmarkBtn) {
        var currentPath = window.location.pathname;
        var bookmarks = JSON.parse(localStorage.getItem('ll-bookmarks') || '[]');

        function isBookmarked() {
            return bookmarks.some(function(b) { return b.path === currentPath; });
        }

        function updateBookmarkUI() {
            if (isBookmarked()) {
                bookmarkBtn.classList.add('bookmarked');
                bookmarkBtn.querySelector('.bookmark-icon').textContent = '\u2605';
            } else {
                bookmarkBtn.classList.remove('bookmarked');
                bookmarkBtn.querySelector('.bookmark-icon').textContent = '\u2606';
            }
        }

        bookmarkBtn.addEventListener('click', function () {
            if (isBookmarked()) {
                var idx = bookmarks.findIndex(function(b) { return b.path === currentPath; });
                bookmarks.splice(idx, 1);
            } else {
                var title = document.querySelector('.article-content h1');
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

    // ===== TOC Active Tracking =====
    var tocLinks = document.querySelectorAll('#toc-list a');
    if (tocLinks.length > 0) {
        var headings = [];
        tocLinks.forEach(function (link) {
            var id = link.getAttribute('href');
            if (!id) return;
            id = id.substring(1);
            var el = document.getElementById(id);
            if (el) headings.push({ el: el, link: link });
        });

        function updateActiveTOC() {
            var active = null;
            for (var i = headings.length - 1; i >= 0; i--) {
                var rect = headings[i].el.getBoundingClientRect();
                if (rect.top <= 120) {
                    active = headings[i];
                    break;
                }
            }
            tocLinks.forEach(function(l) { l.classList.remove('active'); });
            if (active) {
                active.link.classList.add('active');
            }
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
                var text = node.textContent;
                var lower = text.toLowerCase();
                var found = false;
                for (var i = 0; i < terms.length; i++) {
                    if (lower.indexOf(terms[i]) !== -1) { found = true; break; }
                }
                if (!found) return;

                var frag = document.createDocumentFragment();
                var remaining = text;
                while (remaining.length > 0) {
                    var bestIdx = remaining.length;
                    var bestTerm = '';
                    for (var i = 0; i < terms.length; i++) {
                        var idx = remaining.toLowerCase().indexOf(terms[i]);
                        if (idx !== -1 && idx < bestIdx) {
                            bestIdx = idx;
                            bestTerm = terms[i];
                        }
                    }
                    if (bestTerm === '') {
                        frag.appendChild(document.createTextNode(remaining));
                        break;
                    }
                    if (bestIdx > 0) {
                        frag.appendChild(document.createTextNode(remaining.substring(0, bestIdx)));
                    }
                    var mark = document.createElement('mark');
                    mark.className = 'search-highlight';
                    mark.textContent = remaining.substring(bestIdx, bestIdx + bestTerm.length);
                    frag.appendChild(mark);
                    remaining = remaining.substring(bestIdx + bestTerm.length);
                }
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'MARK') {
                var children = Array.prototype.slice.call(node.childNodes);
                children.forEach(highlightNode);
            }
        }

        highlightNode(article);

        // Scroll to first highlight
        var firstMark = article.querySelector('.search-highlight');
        if (firstMark) {
            setTimeout(function() {
                firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
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
            var strongs = article.querySelectorAll('strong');
            strongs.forEach(function(el) {
                var text = el.textContent.trim();
                var parent = el.parentElement;
                if (text.length > 3 && text.length < 100 && parent) {
                    var context = parent.textContent.trim();
                    if (context.length > 20 && context.length < 500) {
                        facts.push({ term: text, context: context });
                    }
                }
            });
            var lis = article.querySelectorAll('li');
            lis.forEach(function(li) {
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
                quizBody.innerHTML = '<p class="quiz-empty">Not enough content to generate a quiz for this note.</p>';
                return;
            }

            var selected = [];
            var pool = facts.slice();
            for (var i = 0; i < Math.min(5, pool.length); i++) {
                var idx = Math.floor(Math.random() * pool.length);
                selected.push(pool.splice(idx, 1)[0]);
            }

            var html = '<div class="quiz-questions">';
            selected.forEach(function(fact, qIdx) {
                var blank = fact.term;
                var question = fact.context.replace(blank, '<span class="quiz-blank">______</span>');
                html += '<div class="quiz-question">';
                html += '<p class="quiz-q"><strong>Q' + (qIdx + 1) + '.</strong> ' + question + '</p>';
                html += '<button class="quiz-reveal" data-answer="' + escapeAttr(blank) + '">Show Answer</button>';
                html += '<p class="quiz-answer hidden"><strong>Answer:</strong> ' + escapeHtml(blank) + '</p>';
                html += '</div>';
            });
            html += '<button class="quiz-regenerate" id="quiz-regenerate">Generate New Questions</button>';
            html += '</div>';
            quizBody.innerHTML = html;

            quizBody.querySelectorAll('.quiz-reveal').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var answer = btn.nextElementSibling;
                    answer.classList.remove('hidden');
                    btn.style.display = 'none';
                });
            });

            var regen = document.getElementById('quiz-regenerate');
            if (regen) {
                regen.addEventListener('click', generateQuiz);
            }
        }

        quizBtn.addEventListener('click', function() {
            generateQuiz();
            quizModal.classList.add('active');
        });

        quizClose.addEventListener('click', function() {
            quizModal.classList.remove('active');
        });

        quizModal.addEventListener('click', function(e) {
            if (e.target === quizModal) quizModal.classList.remove('active');
        });
    }

    // ===== Flashcards =====
    var fcBtn = document.getElementById('btn-flashcards');
    var fcModal = document.getElementById('flashcard-modal');
    var fcClose = document.getElementById('flashcard-close');
    var fcInner = document.getElementById('flashcard-inner');
    var fcFront = document.getElementById('flashcard-front');
    var fcBack = document.getElementById('flashcard-back');
    var fcPrev = document.getElementById('fc-prev');
    var fcNext = document.getElementById('fc-next');
    var fcCount = document.getElementById('fc-count');

    if (fcBtn && fcModal) {
        var cards = [];
        var currentCard = 0;

        function extractCards() {
            var article = document.getElementById('article-content');
            if (!article) return [];
            var result = [];
            var seen = {};

            // 1. Heading → content pairs (best for revision)
            var headingsEl = article.querySelectorAll('h2, h3');
            headingsEl.forEach(function(h) {
                var content = [];
                var next = h.nextElementSibling;
                // Collect content until next heading (max 3 elements)
                var count = 0;
                while (next && count < 3 && !/^H[1-3]$/.test(next.tagName)) {
                    if (next.tagName === 'P' || next.tagName === 'UL' || next.tagName === 'OL') {
                        content.push(next.textContent.trim());
                    }
                    next = next.nextElementSibling;
                    count++;
                }
                var back = content.join(' ').substring(0, 400);
                if (back.length > 20) {
                    var front = h.textContent.trim();
                    if (!seen[front]) {
                        seen[front] = true;
                        result.push({ front: front, back: back });
                    }
                }
            });

            // 2. Bold terms → surrounding context (key facts for revision)
            var strongs = article.querySelectorAll('strong');
            strongs.forEach(function(el) {
                var term = el.textContent.trim();
                if (term.length < 4 || term.length > 80) return;
                // Skip if it's just a common word (not a key concept)
                if (/^[a-z]/.test(term) && term.split(' ').length < 2) return;
                var parent = el.parentElement;
                if (!parent) return;
                var ctx = parent.textContent.trim();
                if (ctx.length < 25 || ctx.length > 400 || ctx === term) return;
                if (!seen[term]) {
                    seen[term] = true;
                    result.push({ front: term, back: ctx });
                }
            });

            return result;
        }

        function showCard() {
            if (cards.length === 0) return;
            fcFront.textContent = cards[currentCard].front;
            fcBack.textContent = cards[currentCard].back;
            fcCount.textContent = (currentCard + 1) + '/' + cards.length;
            fcInner.classList.remove('flipped');
        }

        fcBtn.addEventListener('click', function() {
            cards = extractCards();
            currentCard = 0;
            if (cards.length === 0) {
                fcFront.textContent = 'No flashcards available for this note.';
                fcBack.textContent = '';
                fcCount.textContent = '0/0';
            } else {
                showCard();
            }
            fcModal.classList.add('active');
        });

        if (fcInner) {
            fcInner.addEventListener('click', function() {
                fcInner.classList.toggle('flipped');
            });
        }

        if (fcPrev) {
            fcPrev.addEventListener('click', function() {
                if (cards.length === 0) return;
                currentCard = (currentCard - 1 + cards.length) % cards.length;
                showCard();
            });
        }

        if (fcNext) {
            fcNext.addEventListener('click', function() {
                if (cards.length === 0) return;
                currentCard = (currentCard + 1) % cards.length;
                showCard();
            });
        }

        fcClose.addEventListener('click', function() {
            fcModal.classList.remove('active');
        });

        fcModal.addEventListener('click', function(e) {
            if (e.target === fcModal) fcModal.classList.remove('active');
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!fcModal.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') { fcPrev.click(); }
            if (e.key === 'ArrowRight') { fcNext.click(); }
            if (e.key === ' ') { e.preventDefault(); fcInner.click(); }
            if (e.key === 'Escape') { fcClose.click(); }
        });
    }

    // ===== Helper functions =====
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

})();
