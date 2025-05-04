import { JSDOM } from 'jsdom';
import axios from 'axios';
import { logger } from '../utils/logger';

interface ScrapedPage {
  url: string;
  depth: number;
  content?: {
    title: string;
    content: string;
    images: Array<{
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }>;
  };
}

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

export class ContentOrganizer {
  private readonly imageCache: Map<string, Buffer>;
  private readonly maxImageSize: number;

  constructor() {
    this.imageCache = new Map();
    this.maxImageSize = 5 * 1024 * 1024; // 5MB
  }

  /**
   * Organizes scraped content into a structured format
   * @param pages Array of scraped pages
   * @returns Organized content with table of contents and images
   */
  public async organize(pages: ScrapedPage[]): Promise<OrganizedContent> {
    try {
      // Sort pages by depth and URL for consistent ordering
      const sortedPages = this.sortPages(pages);

      // Download and cache images
      await this.downloadImages(sortedPages);

      // Resolve links and organize content
      const organizedPages = await this.processPages(sortedPages);

      // Generate table of contents
      const tableOfContents = this.generateTableOfContents(organizedPages);

      return {
        title: this.getMainTitle(organizedPages),
        pages: organizedPages,
        tableOfContents,
        images: this.imageCache,
      };
    } catch (error) {
      logger.error('Error organizing content:', error);
      throw error;
    }
  }

  /**
   * Sorts pages by depth and URL
   * @param pages Array of scraped pages
   * @returns Sorted array of pages
   */
  private sortPages(pages: ScrapedPage[]): ScrapedPage[] {
    return [...pages].sort((a, b) => {
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }
      return a.url.localeCompare(b.url);
    });
  }

  /**
   * Downloads and caches images from all pages
   * @param pages Array of scraped pages
   */
  private async downloadImages(pages: ScrapedPage[]): Promise<void> {
    const imageUrls = new Set<string>();

    // Collect unique image URLs
    pages.forEach(page => {
      if (page.content?.images) {
        page.content.images.forEach((image: { url: string }) => {
          imageUrls.add(image.url);
        });
      }
    });

    // Download images in parallel
    await Promise.all(
      Array.from(imageUrls).map(url => this.downloadImage(url))
    );
  }

  /**
   * Downloads a single image
   * @param url Image URL
   */
  private async downloadImage(url: string): Promise<void> {
    if (this.imageCache.has(url)) {
      return;
    }

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        maxContentLength: this.maxImageSize,
      });

      if (response.status === 200) {
        this.imageCache.set(url, Buffer.from(response.data));
      }
    } catch (error) {
      logger.warn(`Failed to download image: ${url}`, error);
    }
  }

  /**
   * Processes pages to resolve links and organize content
   * @param pages Array of scraped pages
   * @returns Array of organized pages
   */
  private async processPages(pages: ScrapedPage[]): Promise<Array<{
    title: string;
    content: string;
    depth: number;
    order: number;
  }>> {
    return pages.map((page, index) => {
      const dom = new JSDOM(page.content?.content || '');
      const document = dom.window.document;

      // Resolve links
      this.resolveLinks(document, pages);

      // Add page transitions
      this.addPageTransitions(document, index, pages.length);

      return {
        title: page.content?.title || `Page ${index + 1}`,
        content: document.body.innerHTML,
        depth: page.depth,
        order: index,
      };
    });
  }

  /**
   * Resolves links in the document
   * @param document The document to process
   * @param pages Array of all pages
   */
  private resolveLinks(document: Document, pages: ScrapedPage[]): void {
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Find the target page
      const targetPage = pages.find(page => page.url === href);
      if (targetPage) {
        // Add page reference
        link.setAttribute('data-page', targetPage.depth.toString());
      }
    });
  }

  /**
   * Adds page transitions
   * @param document The document to process
   * @param currentIndex Current page index
   * @param totalPages Total number of pages
   */
  private addPageTransitions(
    document: Document,
    currentIndex: number,
    totalPages: number
  ): void {
    const body = document.body;

    // Add page number
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = `Page ${currentIndex + 1} of ${totalPages}`;
    body.insertBefore(pageNumber, body.firstChild);

    // Add navigation if not first/last page
    if (currentIndex > 0 || currentIndex < totalPages - 1) {
      const nav = document.createElement('div');
      nav.className = 'page-navigation';

      if (currentIndex > 0) {
        const prevLink = document.createElement('a');
        prevLink.href = `#page-${currentIndex}`;
        prevLink.textContent = 'Previous';
        nav.appendChild(prevLink);
      }

      if (currentIndex < totalPages - 1) {
        const nextLink = document.createElement('a');
        nextLink.href = `#page-${currentIndex + 2}`;
        nextLink.textContent = 'Next';
        nav.appendChild(nextLink);
      }

      body.appendChild(nav);
    }
  }

  /**
   * Generates table of contents
   * @param pages Array of organized pages
   * @returns Table of contents entries
   */
  private generateTableOfContents(
    pages: Array<{
      title: string;
      content: string;
      depth: number;
      order: number;
    }>
  ): Array<{
    title: string;
    pageNumber: number;
    depth: number;
  }> {
    return pages.map((page, index) => ({
      title: page.title,
      pageNumber: index + 1,
      depth: page.depth,
    }));
  }

  /**
   * Gets the main title from the pages
   * @param pages Array of organized pages
   * @returns Main title
   */
  private getMainTitle(
    pages: Array<{
      title: string;
      content: string;
      depth: number;
      order: number;
    }>
  ): string {
    // Use the title of the first page (usually the main page)
    return pages[0]?.title || 'PDF Book';
  }
} 