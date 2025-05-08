# PDF Generation Implementation

## Overview

The PDF generation system in PDFBooker transforms web content into formatted PDF books. This document outlines the implementation details, components, and how they interact.

## Architecture

The system follows a client-server architecture:

1. **Frontend (Next.js)**
   - User interface for configuration and progress tracking
   - API routes to proxy requests to the backend
   - Client-side progress tracking with SSE

2. **Backend (Express)**
   - Web scraping service
   - Content organization service
   - PDF generation service
   - Progress tracking with SSE

## Components

### Frontend Components

1. **PDF Generation Dialog (`app/components/pdf-generation-dialog.tsx`)**
   - Dialog UI for PDF generation progress
   - Shows progress status and percentage
   - Provides error handling and retry options

2. **PDF Generation Hook (`lib/hooks/use-pdf-generation.ts`)**
   - Handles PDF generation requests
   - Manages SSE connection for progress tracking
   - Handles file downloading and errors

3. **API Routes**
   - `/api/generate-pdf` - Proxies PDF generation requests to backend
   - `/api/generate-pdf/progress` - Proxies SSE progress updates from backend

### Backend Services

1. **Web Scraper (`server/src/services/scraper.ts`)**
   - Crawls websites to specified depth
   - Respects robots.txt and rate limiting
   - Reports progress during crawling

2. **Content Organizer (`server/src/services/content-organizer.ts`)**
   - Processes scraped content into structured format
   - Handles image downloading and caching
   - Generates table of contents

3. **PDF Generator (`server/src/services/pdf-generator.ts`)**
   - Converts organized content to PDF
   - Applies user-specified formatting options
   - Handles page layout and styling

## Data Flow

1. User configures PDF generation options in the UI
2. Frontend sends request to `/api/generate-pdf`
3. Next.js API route forwards request to backend
4. Backend processes the request in stages:
   - Web scraping (with progress updates)
   - Content organization
   - PDF generation
5. Progress updates are sent via SSE
6. Completed PDF is returned to the client
7. Frontend downloads the PDF for the user

## Progress Tracking

The system uses Server-Sent Events (SSE) for real-time progress updates:

1. **Backend Implementation**
   - Maintains a progress map for each URL
   - Sends updates at regular intervals
   - Includes progress percentage and status message

2. **Frontend Implementation**
   - Connects to SSE endpoint
   - Updates UI based on progress events
   - Handles connection errors and reconnection

## Error Handling

1. **Backend Errors**
   - Logged with detailed information
   - Sent to client with meaningful messages
   - Updates progress map with error status

2. **Frontend Errors**
   - Displayed in UI with retry options
   - Toast notifications for user feedback
   - Console logging for debugging

## Security Considerations

1. User authentication required for API requests
2. Rate limiting on backend services
3. Robots.txt compliance for ethical web scraping
4. Input validation on all user-provided data

## Future Improvements

1. Queue system for handling multiple PDF generation requests
2. Caching of frequently accessed content
3. PDF compression options
4. Custom templates and styling options
5. Parallel processing for faster generation 