# Frontend Development Plan

## 1. Authentication
- Implement login/signup UI with OAuth (Google, GitHub) and email/password.
- Integrate with backend/session.
- Add user feedback for login errors and loading states.

## 2. Multi-Step PDF Creator
- Build a modal with a stepper for:
  1. Custom Styling (name, font, color, TOC)
  2. Output Format (text-only, text+images, full replica)
  3. Crawler Settings (URL, depth, options)
  4. Post-Crawl Chooser (drag-and-drop, thumbnails)
  5. Arranger (drag-and-drop ordering, preview)
  6. Review & Generate
- Validate each step and show errors inline.

## 3. Progress Feedback
- Show real-time progress bars and toasts during crawling and PDF generation (using SSE or polling).

## 4. PDF Book Management
- Display real user PDFs (fetched from backend).
- Add download, delete, and share actions.

## 5. Error Handling & UX
- Add user-friendly error messages and loading states.

## 6. Accessibility & Responsiveness
- Audit and fix ARIA, keyboard navigation, and mobile layouts.

## 7. Dark Mode
- Ensure all components support dark mode.