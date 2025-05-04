import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { logger } from '../utils/logger';

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

export class ContentCleaner {
  private readonly readability: Readability;

  constructor() {
    this.readability = new Readability({} as Document);
  }

  /**
   * Cleans and extracts content from HTML
   * @param html The HTML content to clean
   * @param url The URL of the page (for resolving relative URLs)
   * @returns Cleaned content with metadata
   */
  public async clean(html: string, url: string): Promise<CleanedContent> {
    try {
      // Create a DOM from the HTML
      const dom = new JSDOM(html, {
        url,
        runScripts: 'dangerously',
        resources: 'usable',
      });

      // Remove unwanted elements before readability processing
      this.removeUnwantedElements(dom.window.document);

      // Process with Readability
      const article = this.readability.parse(dom.window.document);

      if (!article) {
        throw new Error('Failed to extract content with Readability');
      }

      // Extract images and links
      const images = this.extractImages(dom.window.document, url);
      const links = this.extractLinks(dom.window.document, url);

      // Normalize content
      const normalizedContent = this.normalizeContent(article.content);

      return {
        title: article.title || '',
        content: normalizedContent,
        textContent: article.textContent || '',
        length: article.length || 0,
        excerpt: article.excerpt || '',
        byline: article.byline || '',
        siteName: article.siteName || '',
        images,
        links,
      };
    } catch (error) {
      logger.error('Error cleaning content:', error);
      throw error;
    }
  }

  /**
   * Removes unwanted elements from the document
   * @param document The document to clean
   */
  private removeUnwantedElements(document: Document): void {
    // Remove ads
    const adSelectors = [
      '[class*="ad-"]',
      '[id*="ad-"]',
      '[class*="banner"]',
      '[id*="banner"]',
      'iframe[src*="ads"]',
      'iframe[src*="banner"]',
    ];

    // Remove navigation
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '[class*="nav"]',
      '[id*="nav"]',
      '[class*="menu"]',
      '[id*="menu"]',
    ];

    // Remove footers
    const footerSelectors = [
      'footer',
      '[class*="footer"]',
      '[id*="footer"]',
    ];

    // Remove social media
    const socialSelectors = [
      '[class*="social"]',
      '[id*="social"]',
      '[class*="share"]',
      '[id*="share"]',
    ];

    // Remove comments
    const commentSelectors = [
      '[class*="comment"]',
      '[id*="comment"]',
      '[class*="disqus"]',
      '[id*="disqus"]',
    ];

    const selectors = [
      ...adSelectors,
      ...navSelectors,
      ...footerSelectors,
      ...socialSelectors,
      ...commentSelectors,
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });
  }

  /**
   * Extracts images from the document
   * @param document The document to extract from
   * @param baseUrl The base URL for resolving relative URLs
   * @returns Array of image information
   */
  private extractImages(document: Document, baseUrl: string): Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }> {
    const images: Array<{
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }> = [];

    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (!src) return;

      const url = new URL(src, baseUrl).toString();
      const alt = img.getAttribute('alt') || '';
      const width = parseInt(img.getAttribute('width') || '');
      const height = parseInt(img.getAttribute('height') || '');

      images.push({
        url,
        alt,
        width: isNaN(width) ? undefined : width,
        height: isNaN(height) ? undefined : height,
      });
    });

    return images;
  }

  /**
   * Extracts links from the document
   * @param document The document to extract from
   * @param baseUrl The base URL for resolving relative URLs
   * @returns Array of link URLs
   */
  private extractLinks(document: Document, baseUrl: string): string[] {
    const links: string[] = [];

    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        const url = new URL(href, baseUrl).toString();
        links.push(url);
      } catch (error) {
        // Skip invalid URLs
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Normalizes the content for PDF generation
   * @param content The HTML content to normalize
   * @returns Normalized HTML content
   */
  private normalizeContent(content: string): string {
    // Create a temporary DOM to manipulate the content
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Ensure proper heading hierarchy
    this.normalizeHeadings(document);

    // Clean up whitespace
    this.cleanWhitespace(document);

    // Convert relative URLs to absolute
    this.convertRelativeUrls(document);

    return document.body.innerHTML;
  }

  /**
   * Normalizes heading hierarchy
   * @param document The document to normalize
   */
  private normalizeHeadings(document: Document): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentLevel = 1;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level > currentLevel + 1) {
        // Skip levels to maintain hierarchy
        currentLevel = level - 1;
      }
      // Create a new heading element with the correct level
      const newHeading = document.createElement(`h${currentLevel}`);
      newHeading.innerHTML = heading.innerHTML;
      heading.parentNode?.replaceChild(newHeading, heading);
      currentLevel++;
    });
  }

  /**
   * Cleans up whitespace in the document
   * @param document The document to clean
   */
  private cleanWhitespace(document: Document): void {
    // Remove empty elements
    document.querySelectorAll('*').forEach(element => {
      if (!element.textContent?.trim() && !element.querySelector('img')) {
        element.remove();
      }
    });

    // Normalize whitespace in text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent) {
        node.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      }
    }
  }

  /**
   * Converts relative URLs to absolute
   * @param document The document to process
   */
  private convertRelativeUrls(document: Document): void {
    const elements = document.querySelectorAll('[src], [href]');
    elements.forEach(element => {
      const src = element.getAttribute('src');
      const href = element.getAttribute('href');

      if (src) {
        try {
          const url = new URL(src, document.baseURI).toString();
          element.setAttribute('src', url);
        } catch (error) {
          // Skip invalid URLs
        }
      }

      if (href) {
        try {
          const url = new URL(href, document.baseURI).toString();
          element.setAttribute('href', url);
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });
  }
} 