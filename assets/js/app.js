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
        { id: 'computer-science', name: 'Computer Science', icon: '💻', desc: 'Programming, DSA & OS' },
        { id: 'analog-electronics', name: 'Analog Electronics', icon: '📻', desc: 'Diodes, BJTs, Op-Amps' },
        { id: 'digital-electronics', name: 'Digital Electronics', icon: '1️⃣', desc: 'Logic gates, boolean algebra' },
        { id: 'edc', name: 'EDC', icon: '⚡', desc: 'Electronic Devices and Circuits' },
        { id: 'network-theory', name: 'Network Theory', icon: '🕸️', desc: 'Circuit analysis and theorems' },
        { id: 'communications', name: 'Communications', icon: '📡', desc: 'Analog and digital communication' },
        { id: 'control-systems', name: 'Control Systems', icon: '🎛️', desc: 'System stability and design' },
        { id: 'emft', name: 'EMFT', icon: '🧲', desc: 'Electromagnetic Field Theory' },
        { id: 'signals-and-systems', name: 'Signals and Systems', icon: '〰️', desc: 'Continuous and discrete signals' }
    ];

    var notes = [];

    async function init() {
        try {
            var r = await fetch('notes/index.json?v=' + Date.now());
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
        var recentNotes = notes.slice(0, 6);
        var html = '';
        recentNotes.forEach(function(n, idx) {
            var cat = categories.find(function(c) { return c.id === n.category; });
            var catName = cat ? cat.name : n.category;
            var title = n.title;
            var badge = '';
            var match = title.match(/^0*(\d+)\s+(.+)$/);
            if (match) {
                badge = '<div style="font-size:var(--text-xs);color:var(--c-accent);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Unit ' + match[1] + '</div>';
                title = match[2];
            } else {
                badge = '<div style="font-size:var(--text-xs);color:var(--c-accent);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Unit ' + (idx + 1) + '</div>';
            }
            html += '<a href="' + LL.basePath + n.path + '" class="note-card" style="display:flex;flex-direction:column;justify-content:space-between">' +
                '<div>' + badge + '<h4 style="margin-top:0">' + LL.escapeHtml(title) + '</h4></div>' +
                '<div class="meta" style="margin-top:var(--space-sm)"><span class="tag">' + LL.escapeHtml(catName) + '</span>' +
                '<span>' + LL.escapeHtml(n.exam || 'General') + '</span></div></a>';
        });
        list.innerHTML = html;
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
