# API v1

## Overview

All endpoints are now versioned under `/api/v1/` for stability and future-proofing.

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

- `code`: Machine-readable error code
- `message`: Human-readable error message
- `details`: Optional additional information

## Endpoints

- `GET /api/v1/pdfs` — List all PDFs for the user
- `GET /api/v1/pdfs/:id` — Download a specific PDF
- `DELETE /api/v1/pdfs/:id` — Delete a specific PDF
- `POST /api/v1/generate-pdf` — Generate a PDF (multipart/form-data)
- `GET /api/v1/generate-pdf/progress` — Get PDF generation progress (SSE)
- `POST /api/v1/crawl` — Crawl a site and return metadata
- `GET|POST /api/v1/auth/[...nextauth]` — Authentication (NextAuth)

## Next Steps

- Add OpenAPI/Swagger documentation for all endpoints
- Add code samples and webhook documentation 