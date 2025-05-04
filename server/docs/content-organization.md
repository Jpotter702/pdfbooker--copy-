# Content Organization Documentation

## Overview

The content organization system processes scraped pages to create a well-structured document suitable for PDF generation. It handles link resolution, image downloading, content organization, and table of contents generation.

## Components

### ContentOrganizer (`src/services/content-organizer.ts`)

The main class responsible for organizing content.

#### Features
- Link resolution and cross-referencing
- Image downloading and caching
- Content organization by depth
- Table of contents generation
- Page transitions and navigation
- Error handling and logging

#### Usage
```typescript
const organizer = new ContentOrganizer();
const organizedContent = await organizer.organize(scrapedPages);
```

## Content Structure

The organized content is returned in the following format:

```typescript
interface OrganizedContent {
  title: string;
  pages: Array<{
    title: string;
    content: string;
    depth: number;
    order: number;
  }>;
  tableOfContents: Array<{
    title: string;
    pageNumber: number;
    depth: number;
  }>;
  images: Map<string, Buffer>;
}
```

## Organization Process

1. **Page Sorting**
   - Sorts pages by depth and URL
   - Ensures consistent ordering
   - Maintains logical flow

2. **Image Processing**
   - Downloads images in parallel
   - Caches images for reuse
   - Handles image size limits
   - Manages failed downloads

3. **Content Processing**
   - Resolves internal links
   - Adds page transitions
   - Includes page numbers
   - Adds navigation elements

4. **Table of Contents**
   - Generates from page titles
   - Includes page numbers
   - Maintains depth hierarchy
   - Supports navigation

## Link Resolution

The system handles links in the following ways:

1. **Internal Links**
   - Resolves to page references
   - Adds data attributes for PDF generation
   - Maintains link context

2. **External Links**
   - Preserves original URLs
   - Marks as external
   - Adds visual indicators

3. **Image Links**
   - Downloads and caches images
   - Converts to local references
   - Handles relative paths

## Page Transitions

Each page includes:

1. **Page Numbers**
   - Current page number
   - Total page count
   - Consistent formatting

2. **Navigation**
   - Previous/Next links
   - First/Last page handling
   - Visual indicators

3. **Headers/Footers**
   - Page title
   - Section information
   - Navigation elements

## Image Handling

The system manages images with:

1. **Downloading**
   - Parallel downloads
   - Size limits (5MB)
   - Error handling
   - Retry logic

2. **Caching**
   - In-memory cache
   - URL-based keys
   - Reuse across pages
   - Memory management

3. **Processing**
   - Format preservation
   - Size optimization
   - Alt text handling
   - Layout consideration

## Best Practices

1. **Content Organization**
   - Maintain logical flow
   - Preserve hierarchy
   - Handle edge cases
   - Ensure consistency

2. **Link Resolution**
   - Validate URLs
   - Handle errors
   - Preserve context
   - Add metadata

3. **Image Management**
   - Set size limits
   - Handle failures
   - Optimize storage
   - Preserve quality

4. **Error Handling**
   - Log errors
   - Graceful degradation
   - User feedback
   - Recovery options

## Limitations

1. **Image Size**
   - Limited to 5MB per image
   - Memory constraints
   - Download timeouts

2. **Link Resolution**
   - Limited to internal links
   - No JavaScript links
   - No dynamic content

3. **Content Structure**
   - Fixed hierarchy
   - Limited customization
   - No dynamic ordering

4. **Performance**
   - Memory usage
   - Download time
   - Processing overhead

## Future Improvements

1. **Image Handling**
   - Compression
   - Format conversion
   - Lazy loading
   - Progressive loading

2. **Link Resolution**
   - JavaScript support
   - Dynamic content
   - Custom handlers
   - Link validation

3. **Content Organization**
   - Custom ordering
   - Dynamic structure
   - Content analysis
   - Smart grouping

4. **Performance**
   - Parallel processing
   - Caching improvements
   - Memory optimization
   - Progress tracking 