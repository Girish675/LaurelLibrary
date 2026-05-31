/**
 * Laurel Library — Homepage v2.0
 */
(function() {
    'use strict';
    var LL = window.LL || {};

    var categories = [
        { id: 'geography', name: 'Geography', icon: '🌍', desc: 'Physical, human & economic geography' },
        { id: 'history', name: 'History', icon: '📜', desc: 'Ancient, medieval & modern India' },
        { id: 'polity', name: 'Polity', icon: '⚖️', desc: 'Constitution, governance & law' },
        { id: 'economics', name: 'Economics', icon: '📊', desc: 'Micro, macro & Indian economy' },
        { id: 'science', name: 'General Science', icon: '🔬', desc: 'Physics, chemistry & biology' },
        { id: 'mathematics', name: 'Mathematics', icon: 'π', desc: 'Algebra, calculus & geometry' },
        { id: 'reasoning', name: 'Reasoning', icon: '🧠', desc: 'Logical & analytical reasoning' },
        { id: 'english', name: 'English', icon: '📝', desc: 'Grammar, vocabulary & comprehension' },
        { id: 'current-affairs', name: 'Current Affairs', icon: '🌐', desc: 'National & international events' },
        { id: 'general-knowledge', name: 'General Knowledge', icon: '💡', desc: 'Static GK & awareness' },
        { id: 'aptitude', name: 'Aptitude', icon: '🧮', desc: 'Quantitative & numerical ability' },
        { id: 'computer-science', name: 'Computer Science', icon: '💻', desc: 'Programming, DSA & OS' }
    ];

    var notes = [];

    async function init() {
        try {
            var r = await fetch('notes/index.json');
            if (r.ok) {
                var data = await r.json();
                notes = data.notes || [];
            }
        } catch(e) {}
        render();
    }

    function render() {
        renderStats();
        renderCategories();
        renderRecent();
        renderExams();
    }

    function renderStats() {
        var el = document.getElementById('stat-notes');
        if (el) el.textContent = notes.length;
        var el2 = document.getElementById('stat-subjects');
        if (el2) {
            var cats = new Set();
            notes.forEach(function(n) { cats.add(n.category); });
            el2.textContent = Math.max(cats.size, categories.length);
        }
        var el3 = document.getElementById('stat-streak');
        if (el3) el3.textContent = LL.streak.get();
        var el4 = document.getElementById('stat-xp');
        if (el4) el4.textContent = LL.xp.get();
    }

    function renderCategories() {
        var grid = document.getElementById('category-grid');
        if (!grid) return;

        var counts = {};
        notes.forEach(function(n) { counts[n.category] = (counts[n.category] || 0) + 1; });

        grid.innerHTML = categories.map(function(cat) {
            var count = counts[cat.id] || 0;
            return '<a href="notes/index.html?category=' + encodeURIComponent(cat.id) + '" class="category-card">' +
                '<div class="cat-icon">' + cat.icon + '</div>' +
                '<div class="cat-info"><h4>' + cat.name + '</h4>' +
                '<p>' + (count > 0 ? count + ' notes' : cat.desc) + '</p></div></a>';
        }).join('');
    }

    function renderRecent() {
        var list = document.getElementById('recent-notes');
        if (!list) return;
        if (notes.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><h3>Notes coming soon</h3><p>We\'re adding study material. Check back soon!</p></div>';
            return;
        }
        var recent = notes.slice(0, 6);
        list.innerHTML = recent.map(function(n) {
            var cat = categories.find(function(c) { return c.id === n.category; });
            var catName = cat ? cat.name : n.category;
            return '<a href="' + n.path + '" class="note-card"><h4>' + LL.escapeHtml(n.title) + '</h4>' +
                '<div class="meta"><span class="tag">' + LL.escapeHtml(catName) + '</span>' +
                '<span>' + LL.escapeHtml(n.exam || 'General') + '</span></div></a>';
        }).join('');
    }

    function renderExams() {
        var grid = document.getElementById('exam-grid');
        if (!grid) return;
        var exams = [
            { name: 'UPSC', icon: '🏛️', desc: 'Civil Services, CDS, NDA, CAPF', tags: ['IAS','IPS','IFS'] },
            { name: 'SSC', icon: '🏆', desc: 'CGL, CHSL, MTS, CPO, Stenographer', tags: ['CGL','CHSL'] },
            { name: 'Banking', icon: '🏦', desc: 'IBPS PO/Clerk, SBI PO/Clerk, RBI', tags: ['IBPS','SBI'] },
            { name: 'GATE', icon: '⚙️', desc: 'Engineering & Science streams', tags: ['CSE','ECE','EE'] },
            { name: 'Railways', icon: '🚃', desc: 'RRB NTPC, Group D, ALP, JE', tags: ['NTPC','ALP'] },
            { name: 'Defence', icon: '🎖️', desc: 'CDS, NDA, AFCAT, Territorial Army', tags: ['CDS','NDA'] }
        ];
        grid.innerHTML = exams.map(function(ex) {
            return '<a href="exams/exam.html?exam=' + encodeURIComponent(ex.name) + '" class="exam-card"><div class="exam-icon">' + ex.icon + '</div>' +
                '<h3>' + ex.name + '</h3><p>' + ex.desc + '</p>' +
                '<div class="exam-tags">' + ex.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div></a>';
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', init);
})();
