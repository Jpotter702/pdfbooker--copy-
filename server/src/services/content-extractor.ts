import * as cheerio from 'cheerio';
import { logger } from '../config';

export interface ExtractedContent {
  title: string;
  content: string;
  metadata: {
    description?: string;
    author?: string;
    publishDate?: string;
    modifiedDate?: string;
  };
  images: Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  links: string[];
}

export class ContentExtractor {
  extract(html: string, baseUrl: string): ExtractedContent {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    this.removeUnwantedElements($);
    
    // Extract metadata
    const metadata = this.extractMetadata($);
    
    // Extract main content
    const mainContent = this.extractMainContent($);
    
    // Extract images
    const images = this.extractImages($, baseUrl);
    
    // Extract links
    const links = this.extractLinks($, baseUrl);

    return {
      title: this.extractTitle($),
      content: mainContent,
      metadata,
      images,
      links
    };
  }

  private removeUnwantedElements($: cheerio.CheerioAPI): void {
    // Remove common non-content elements
    $([
      'script',
      'style',
      'iframe',
      'noscript',
      'nav',
      'header:not(:first-child)',
      'footer',
      'aside',
      '.ad',
      '.advertisement',
      '.social-share',
      '.comments',
      '[class*="cookie"]',
      '[class*="popup"]',
      '[class*="newsletter"]',
      '[id*="cookie"]',
      '[id*="popup"]',
      '[id*="newsletter"]'
    ].join(',')).remove();
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    // Try different title sources in order of preference
    return (
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').text() ||
      ''
    ).trim();
  }

  private extractMetadata($: cheerio.CheerioAPI) {
    return {
      description: (
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        ''
      ).trim(),
      author: (
        $('meta[name="author"]').attr('content') ||
        $('meta[property="article:author"]').attr('content') ||
        ''
      ).trim(),
      publishDate: (
        $('meta[property="article:published_time"]').attr('content') ||
        $('time[pubdate]').attr('datetime') ||
        ''
      ).trim(),
      modifiedDate: (
        $('meta[property="article:modified_time"]').attr('content') ||
        $('time[datetime]').attr('datetime') ||
        ''
      ).trim()
    };
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find the main content container
    const mainSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.main-content',
      '#main-content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ];

    let $main = $();
    for (const selector of mainSelectors) {
      $main = $(selector);
      if ($main.length > 0) break;
    }

    // If no main content container found, use body
    if ($main.length === 0) {
      $main = $('body');
    }

    // Clean up the content
    this.cleanContent($main);

    return $main.text().trim();
  }

  private cleanContent($elem: cheerio.Cheerio<cheerio.Element>): void {
    // Remove empty elements
    $elem.find(':empty').not('img, br, hr, input, textarea').remove();

    // Normalize whitespace
    $elem.find('*').each((_, elem) => {
      if (elem.type === 'text') {
        elem.data = elem.data.replace(/\s+/g, ' ').trim();
      }
    });
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): ExtractedContent['images'] {
    const images: ExtractedContent['images'] = [];

    $('img').each((_, elem) => {
      const $img = $(elem);
      const src = $img.attr('src') || $img.attr('data-src');
      
      if (src) {
        try {
          const imageUrl = new URL(src, baseUrl).href;
          images.push({
            url: imageUrl,
            alt: $img.attr('alt') || '',
            width: parseInt($img.attr('width') || '0') || undefined,
            height: parseInt($img.attr('height') || '0') || undefined
          });
        } catch (error) {
          logger.warn(`Failed to process image URL: ${src}`, error);
        }
      }
    });

    return images;
  }

  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];

    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const url = new URL(href, baseUrl).href;
          if (url.startsWith('http')) {
            links.push(url);
          }
        } catch (error) {
          logger.warn(`Failed to process link URL: ${href}`, error);
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }
} 