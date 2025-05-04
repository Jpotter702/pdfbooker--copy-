# Content Cleaning Documentation

## Overview

The content cleaning system processes scraped HTML content to extract the main content, remove unwanted elements, and prepare it for PDF generation. It uses Mozilla's Readability library for content extraction and implements additional cleaning and normalization features.

## Components

### ContentCleaner (`src/services/content-cleaner.ts`)

The main class responsible for cleaning and processing HTML content.

#### Features
- Main content extraction using Readability
- Removal of ads, navigation, footers, and other non-content elements
- Image and link extraction
- Content normalization
- Heading hierarchy maintenance
- Whitespace cleaning
- URL normalization

#### Usage
```typescript
const cleaner = new ContentCleaner();
const cleanedContent = await cleaner.clean(html, url);
```

## Content Structure

The cleaned content is returned in the following format:

```typescript
interface CleanedContent {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  siteName: string;
  images: Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  links: string[];
}
```

## Cleaning Process

1. **Initial Processing**
   - Creates a DOM from the HTML
   - Removes unwanted elements
   - Processes with Readability

2. **Content Extraction**
   - Extracts main content
   - Preserves important images
   - Maintains document structure
   - Extracts metadata

3. **Normalization**
   - Ensures proper heading hierarchy
   - Cleans up whitespace
   - Converts relative URLs to absolute
   - Removes empty elements

## Unwanted Elements

The system removes the following types of elements:

1. **Ads**
   - Elements with ad-related classes/IDs
   - Banner elements
   - Ad iframes

2. **Navigation**
   - Navigation elements
   - Menu elements
   - Breadcrumbs

3. **Footers**
   - Footer elements
   - Copyright notices
   - Site information

4. **Social Media**
   - Social sharing buttons
   - Social media widgets
   - Comment sections

5. **Comments**
   - Comment sections
   - Disqus widgets
   - User-generated content

## Best Practices

1. **Content Extraction**
   - Use Readability for main content extraction
   - Preserve important images and links
   - Maintain document structure

2. **Element Removal**
   - Use specific selectors for unwanted elements
   - Preserve important content
   - Handle edge cases

3. **Normalization**
   - Maintain proper heading hierarchy
   - Clean up whitespace
   - Normalize URLs
   - Remove empty elements

4. **Error Handling**
   - Handle missing content
   - Handle invalid HTML
   - Handle network errors
   - Log errors appropriately

## Limitations

1. **JavaScript Content**
   - Limited support for JavaScript-rendered content
   - May miss dynamically loaded content

2. **Complex Layouts**
   - May not handle complex page layouts well
   - May miss content in certain structures

3. **Custom Elements**
   - May not handle custom elements well
   - May miss content in custom structures

4. **Performance**
   - DOM manipulation can be resource-intensive
   - Large documents may take longer to process

## Future Improvements

1. **JavaScript Support**
   - Add support for JavaScript-rendered content
   - Handle dynamically loaded content

2. **Layout Analysis**
   - Improve handling of complex layouts
   - Better content structure detection

3. **Customization**
   - Allow custom element selectors
   - Support custom cleaning rules

4. **Performance**
   - Optimize DOM manipulation
   - Add caching support
   - Implement parallel processing

5. **Content Analysis**
   - Add content quality scoring
   - Detect and remove duplicate content
   - Improve metadata extraction 