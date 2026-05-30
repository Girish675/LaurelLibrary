# Future Enhancements & Ideas

Suggestions to make Laurel Library even better. Pick what you like!

---

## ✅ Already Implemented

- **Bookmark / Favorites System** — localStorage-based "My List" with quick access
- **Study Progress Tracker** — "Mark as Read" button, per-category progress bar
- **Print-Friendly CSS** — `@media print` hides nav/sidebar/footer for clean printouts
- **Dark / Night Reading Mode** — Toggle in header, CSS variables, localStorage preference

---

## Upcoming Features

### 1. Exam-Wise Index Page
- Browse by exam (UPSC, SSC, GATE, JEE, NEET) instead of just subject
- Tag each note with multiple exams
- Filter/sort functionality

### 2. PDF Download Button
- Keep original PDFs accessible alongside HTML
- "Download PDF" button on each note page
- Useful for offline reading on tablets

### 3. Mnemonics & Tricks Callout Boxes
- Detect trick/mnemonic sections in PDFs
- Render them in a special highlighted callout box
- Example: "TRICK: Gujarati Raja Made Chief Justice Win The Meeting"
- Makes revision faster

### 4. Related Notes Section
- "You might also like" at the bottom of each article
- Based on same category or shared keywords
- Helps students navigate related topics naturally

### 5. Quiz Mode (Auto-generated MCQs)
- Parse bold/highlighted facts from notes
- Generate fill-in-the-blank and MCQ questions
- Example: "India's coastline is ___ km" → Options: 7516.6 / 6100 / 8200 / 5400
- Spaced repetition for revision

### 6. PWA (Progressive Web App)
- Add service worker + manifest.json
- Students can install the site on their phone homescreen
- Works offline after first load
- Push notifications for new notes (optional)

### 7. Revision Flashcards
- Extract key facts as flashcards
- Swipe-based UI on mobile
- Great for quick revision before exams

### 8. Previous Year Question Mapping
- Tag notes with related PYQ references
- "This topic appeared in: SSC CGL 2024, UPSC Prelims 2023"
- Helps prioritize high-yield topics

### 9. Formula / Key Facts Quick Reference
- Separate section with formulae, dates, constants
- Filterable by subject
- One-page cheat sheets per topic

### 10. Batch Conversion Dashboard
- Web UI or CLI progress view for converting all 1000 PDFs
- Error log with links to problematic PDFs
- Resume from last failure point

### 11. Table of Contents Sidebar Collapse
- Collapsible nested sections in the sidebar TOC
- Remember open/closed state per note
- Better navigation for long notes

### 12. Search Highlighting
- When arriving from search, highlight matched terms in the note
- Scroll to first match automatically
- "Next match" / "Previous match" navigation

### 13. Reading Time Estimate
- Show estimated reading time on each note card and header
- Based on word count (~200 wpm average)

---

## Priority Recommendation

| Phase | Features | Effort |
|-------|----------|--------|
| Phase 1 (Next) | Exam-wise index, PDF download, Related notes | Easy-Medium |
| Phase 2 | Quiz mode, Mnemonics callouts, Flashcards | Medium |
| Phase 3 (Later) | PWA, PYQ mapping, Batch dashboard | Higher |
