# Backend Development Plan

## 1. API Layer
- Create REST (or GraphQL) endpoints for:
  - Start crawl/scrape
  - Check progress
  - Generate PDF
  - List/download/delete PDFs
  - Share PDFs (link/email)
- Secure endpoints (auth, input validation, SSRF protection).

## 2. Progress Tracking
- Implement SSE, websockets, or polling endpoints for real-time progress.

## 3. Storage Management
- Store generated PDFs per user.
- Implement cleanup and deletion.

## 4. User Association
- Link crawls and PDFs to authenticated users.

## 5. Batch & Scheduled Processing
- Add endpoints for batch jobs and scheduled scraping (optional/roadmap).

## 6. Export Options
- Add support for EPUB, HTML archive, or offline packages (optional/roadmap).

## 7. API Documentation
- Document all endpoints (OpenAPI/Swagger).

## 8. Security
- Sanitize all inputs, validate URLs, and prevent SSRF.