● Content Processing Pipeline Details

  The content processing pipeline is crucial for PDFBooker. Here's a detailed breakdown:

  1. URL Validation & Normalization

  - Validate URL syntax and accessibility
  - Normalize URLs (handle redirects, resolve shorteners)
  - Check domain against blocklist of known problematic sites

  2. Crawler Service

  - Initial Request: Fetch target URL with proper headers
  - HTML Parsing: Parse DOM and extract links
  - Link Filtering: Filter links based on domain, path, query parameters
  - Depth Management: Track crawl depth and respect user limits
  - Queue Management: Add valid links to crawl queue
  - Visited Tracking: Track visited URLs to avoid duplicates
  - Robots.txt Handling: Parse and respect directives
  - Rate Limiting: Implement delays between requests to same domain

  3. Content Extraction

  - Main Content Detection: Use readability algorithms to identify main content
  - Element Classification: Categorize elements (text, images, tables, code)
  - Structure Preservation: Maintain heading hierarchy and semantic structure
  - Metadata Extraction: Extract page title, publication date, author if available

  4. Media Processing

  - Image Detection: Identify content images vs decorative ones
  - Image Downloading: Download and cache images
  - Image Optimization: Resize and compress for PDF
  - Responsive Images: Handle different image sizes and resolutions
  - Alternative Text: Preserve alt text for accessibility
  - Other Media: Handle videos (thumbnails), audio (links), and embeds

  5. Content Cleaning & Enhancement

  - Element Filtering: Remove ads, popups, navigation, footers
  - Style Cleaning: Remove inline styles or convert to compatible formats
  - Code Handling: Preserve formatting for code blocks with syntax highlighting
  - Table Processing: Handle tables for PDF compatibility
  - Links Processing: Convert internal links to PDF bookmarks
  - Content Organization: Arrange content in logical reading order

  6. Error Handling

  - Connection Issues: Retry failed requests with backoff
  - Parsing Failures: Fallback to simpler extraction methods
  - Timeout Management: Handle long-running requests
  - Content Type Handling: Process different content types appropriately
  - Logging: Record errors for troubleshooting
  - Partial Results: Continue processing despite individual page failures

  7. Intermediate Storage

  - Content Storage: Store processed content in structured format
  - Metadata Storage: Store page metadata for TOC generation
  - Image Cache: Cache downloaded and processed images
  - Job Progress: Track and store processing progress
  - Temporary Storage: Use efficient storage for intermediate results

  8. Output Preparation

  - Content Assembly: Combine all processed pages in sequence
  - Structure Finalization: Ensure proper heading hierarchy across document
  - Link Resolution: Resolve all internal links to their final destinations
  - Media Finalization: Finalize image paths and references
  - Style Preparation: Prepare content for styling in PDF generation phase

  Key Technical Considerations:

  1. Parallelization: Process multiple pages concurrently while respecting rate limits
  2. Memory Management: Handle large sites without excessive memory usage
  3. Cancelation: Support job cancellation at any stage
  4. Resumability: Enable resuming interrupted jobs
  5. Progress Tracking: Provide granular progress updates to frontend

  Pipeline Implementation Approach:

  - Build pipeline as modular, composable stages
  - Use stream processing where possible for efficiency
  - Implement retries and fallbacks for robustness
  - Store intermediate results to enable preview and incremental processing