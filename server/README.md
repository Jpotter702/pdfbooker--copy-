# PDFBooker Server

A Node.js server for web scraping and PDF generation.

## Features

- Web scraping with depth control
- Robots.txt compliance
- Rate limiting
- Content extraction and cleaning
- PDF generation with metadata
- Progress tracking
- Error handling and logging

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Build the project:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## API Endpoints

### POST /api/generate-pdf

Generates a PDF from scraped web content.

#### Request Body
```json
{
  "url": "https://example.com",
  "depth": 2
}
```

#### Response
- Server-Sent Events (SSE) for progress updates
- PDF file download on completion

### GET /health

Health check endpoint.

#### Response
```json
{
  "status": "ok"
}
```

## Documentation

- [Web Scraping](docs/web-scraping.md)
- [PDF Generation](docs/pdf-generation.md)

## Configuration

The server can be configured through environment variables and the `config.ts` file:

- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3000)
- `NODE_ENV`: Environment (development/production)

## Error Handling

The server implements comprehensive error handling:

1. **Input Validation**: Validates request parameters
2. **Scraping Errors**: Handles scraping failures gracefully
3. **PDF Generation Errors**: Provides detailed error messages
4. **Network Errors**: Implements timeouts and retries
5. **Resource Errors**: Properly manages resources

## Logging

The server uses Winston for logging:

- Console output in development
- File logging in production
- Error tracking
- Request logging

## Best Practices

1. **Rate Limiting**: Respect website policies
2. **Resource Management**: Proper cleanup of resources
3. **Error Handling**: Comprehensive error handling
4. **Logging**: Detailed logging for debugging
5. **Configuration**: Environment-based configuration
6. **Security**: CORS and input validation
7. **Performance**: Efficient resource usage

## Limitations

1. **JavaScript Content**: Limited support for JavaScript-rendered content
2. **Authentication**: No built-in authentication support
3. **Large Documents**: May have performance issues with very large documents
4. **Complex Layouts**: May not handle complex page layouts well
5. **Resource Usage**: High memory and CPU usage for large scrapes

## Future Improvements

1. **Authentication**: Add authentication support
2. **JavaScript Rendering**: Improve JavaScript content support
3. **Distributed Scraping**: Add support for distributed scraping
4. **Caching**: Implement content caching
5. **Advanced PDF Features**: Add more PDF generation features
6. **Monitoring**: Add performance monitoring
7. **Testing**: Add comprehensive test coverage 