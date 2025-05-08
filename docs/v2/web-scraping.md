# Web Scraping Documentation

## Overview

The web scraping system is designed to crawl websites recursively, extract content, and generate PDFs while respecting website policies and implementing rate limiting. The system consists of several components working together to provide a robust and efficient scraping solution.

## Components

### 1. WebScraper (`src/services/scraper.ts`)

The main orchestrator that manages the scraping process.

#### Features
- Recursive crawling with configurable depth
- Progress tracking and status updates
- Concurrent request management
- Error handling and logging
- Domain-based rate limiting
- Robots.txt compliance

#### Usage
```typescript
const scraper = new WebScraper();
await scraper.initialize();

// Set up progress callback
scraper.setProgressCallback((progress) => {
  console.log(`Progress: ${progress.pagesScraped}/${progress.totalPages}`);
});

// Start scraping
const results = await scraper.scrape(url, depth, maxPages);

// Cleanup
await scraper.close();
```

### 2. RobotsParser (`src/services/robots-parser.ts`)

Handles robots.txt parsing and caching.

#### Features
- Robots.txt parsing and caching
- User-agent specific rules
- Path matching with wildcards
- Default rules fallback
- Cache expiration

#### Usage
```typescript
const parser = new RobotsParser();
const rules = await parser.getRobotsRules(url);
const isAllowed = parser.isPathAllowed(url, rules);
```

### 3. RateLimiter (`src/services/rate-limiter.ts`)

Manages request rate limiting per domain.

#### Features
- Domain-based rate limiting
- Queue management
- Configurable delays
- Automatic queue processing

#### Usage
```typescript
const limiter = new RateLimiter();
await limiter.acquire(url, delay);
// Make request
limiter.release(url);
```

### 4. ContentExtractor (`src/services/content-extractor.ts`)

Extracts and processes content from HTML.

#### Features
- Main content extraction
- Metadata extraction
- Image handling
- Link processing
- Content cleaning
- Unwanted element removal

#### Usage
```typescript
const extractor = new ContentExtractor();
const content = extractor.extract(html, baseUrl);
```

## Configuration

The scraping behavior can be configured through `src/config.ts`:

```typescript
export const SCRAPING_CONFIG = {
  maxDepth: 5,              // Maximum crawl depth
  maxPages: 100,           // Maximum number of pages to scrape
  requestTimeout: 30000,   // Request timeout in milliseconds
  maxConcurrentRequests: 5, // Maximum concurrent requests
  userAgent: '...'         // User agent string
};
```

## Error Handling

The system implements comprehensive error handling:

1. **Network Errors**: Handled with timeouts and retries
2. **Content Type Errors**: Non-HTML content is skipped
3. **Robots.txt Errors**: Falls back to default rules
4. **Rate Limiting Errors**: Queues requests and retries
5. **Content Extraction Errors**: Logs errors and continues

## Progress Tracking

Progress updates are provided through Server-Sent Events (SSE):

```typescript
interface ScrapingProgress {
  pagesScraped: number;
  totalPages: number;
  currentUrl: string;
  status: 'initializing' | 'scraping' | 'completed' | 'error';
  error?: string;
}
```

## Best Practices

1. **Respect Robots.txt**: Always check and follow robots.txt rules
2. **Rate Limiting**: Implement delays between requests
3. **Error Handling**: Gracefully handle and log errors
4. **Resource Management**: Properly initialize and cleanup resources
5. **Progress Updates**: Provide real-time progress information
6. **Content Validation**: Verify content types and structure
7. **Memory Management**: Limit concurrent requests and page count

## Limitations

1. **JavaScript Content**: Limited support for JavaScript-rendered content
2. **Dynamic Content**: May not capture content loaded after initial page load
3. **Authentication**: No built-in support for authenticated content
4. **CAPTCHA**: No automatic CAPTCHA handling
5. **Resource Intensive**: Requires significant memory and CPU resources

## Future Improvements

1. **JavaScript Rendering**: Add support for JavaScript-rendered content
2. **Authentication**: Implement authentication support
3. **CAPTCHA Handling**: Add CAPTCHA solving capabilities
4. **Content Filtering**: Add more sophisticated content filtering
5. **Caching**: Implement content caching
6. **Distributed Scraping**: Add support for distributed scraping
7. **Custom Extractors**: Allow custom content extractors 