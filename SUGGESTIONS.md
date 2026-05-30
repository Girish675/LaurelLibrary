# Future Enhancements & Ideas

Suggestions to make Laurel Library even better. Pick what you like!

---

## 1. Bookmark / Favorites System
- Let users save notes to a "My List" using localStorage
- Quick access panel on the homepage
- No login needed — works entirely in browser

## 2. Study Progress Tracker
- "Mark as Read" button on each topic
- Progress bar per category (e.g., Geography: 5/20 completed)
- Stored in localStorage — no backend required

## 3. Quiz Mode (Auto-generated MCQs)
- Parse bold/highlighted facts from notes
- Generate fill-in-the-blank and MCQ questions
- Example: "India's coastline is ___ km" → Options: 7516.6 / 6100 / 8200 / 5400
- Spaced repetition for revision

## 4. Print-Friendly CSS
- `@media print` stylesheet for clean printouts
- Hide navigation, sidebar, footer when printing
- Students can print notes for offline study

## 5. Dark / Night Reading Mode
- Toggle button in the header
- Swap CSS variables for dark background
- Save preference in localStorage
- Easier on eyes for late-night study sessions

## 6. Exam-Wise Index Page
- Browse by exam (UPSC, SSC, GATE, JEE, NEET) instead of just subject
- Tag each note with multiple exams
- Filter/sort functionality

## 7. PDF Download Button
- Keep original PDFs accessible alongside HTML
- "Download PDF" button on each note page
- Useful for offline reading on tablets

## 8. Mnemonics & Tricks Callout Boxes
- Detect trick/mnemonic sections in PDFs
- Render them in a special highlighted callout box
- Example: "TRICK: Gujarati Raja Made Chief Justice Win The Meeting"
- Makes revision faster

## 9. Related Notes Section
- "You might also like" at the bottom of each article
- Based on same category or shared keywords
- Helps students navigate related topics naturally

## 10. PWA (Progressive Web App)
- Add service worker + manifest.json
- Students can install the site on their phone homescreen
- Works offline after first load
- Push notifications for new notes (optional)

## 11. Revision Flashcards
- Extract key facts as flashcards
- Swipe-based UI on mobile
- Great for quick revision before exams

## 12. Previous Year Question Mapping
- Tag notes with related PYQ references
- "This topic appeared in: SSC CGL 2024, UPSC Prelims 2023"
- Helps prioritize high-yield topics

## 13. Formula / Key Facts Quick Reference
- Separate section with formulae, dates, constants
- Filterable by subject
- One-page cheat sheets per topic

---

## Priority Recommendation

| Phase | Features | Effort |
|-------|----------|--------|
| Phase 1 (Now) | Dark mode, Print CSS, PDF download | Easy |
| Phase 2 (Next) | Bookmarks, Progress tracker | Medium |
| Phase 3 (Later) | Quiz mode, PWA, Flashcards | Higher |
