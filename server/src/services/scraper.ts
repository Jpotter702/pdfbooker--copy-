import puppeteer, { Browser } from 'puppeteer';
import { logger } from '../config';
import { SCRAPING_CONFIG } from '../config';
import { RobotsParser } from './robots-parser';
import { RateLimiter } from './rate-limiter';
import { ContentExtractor, ExtractedContent } from './content-extractor';

interface ScrapingProgress {
  pagesScraped: number;
  totalPages: number;
  currentUrl: string;
  status: 'initializing' | 'scraping' | 'completed' | 'error';
  error?: string;
}

interface ScrapedPage {
  url: string;
  depth: number;
  content: ExtractedContent;
  error?: string;
}

export class WebScraper {
  private visitedUrls: Set<string>;
  private browser: Browser | null;
  private robotsParser: RobotsParser;
  private rateLimiter: RateLimiter;
  private contentExtractor: ContentExtractor;
  private progress: ScrapingProgress;
  private onProgressUpdate?: (progress: ScrapingProgress) => void;

  constructor() {
    this.visitedUrls = new Set();
    this.browser = null;
    this.robotsParser = new RobotsParser();
    this.rateLimiter = new RateLimiter();
    this.contentExtractor = new ContentExtractor();
    this.progress = {
      pagesScraped: 0,
      totalPages: 0,
      currentUrl: '',
      status: 'initializing'
    };
  }

  setProgressCallback(callback: (progress: ScrapingProgress) => void) {
    this.onProgressUpdate = callback;
  }

  private updateProgress(update: Partial<ScrapingProgress>) {
    this.progress = { ...this.progress, ...update };
    if (this.onProgressUpdate) {
      this.onProgressUpdate(this.progress);
    }
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async fetchPage(url: string, robotsRules: any): Promise<ScrapedPage> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    // Check robots.txt rules
    if (!this.robotsParser.isPathAllowed(url, robotsRules)) {
      throw new Error(`URL ${url} is not allowed by robots.txt`);
    }

    // Apply rate limiting
    await this.rateLimiter.acquire(url, robotsRules.crawlDelay);

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(SCRAPING_CONFIG.userAgent);
      
      // Set reasonable viewport
      await page.setViewport({ width: 1280, height: 800 });

      // Handle different content types
      page.on('response', async (response) => {
        const contentType = response.headers()['content-type'];
        if (contentType && !contentType.includes('text/html')) {
          logger.info(`Skipping non-HTML content: ${url} (${contentType})`);
          throw new Error(`Unsupported content type: ${contentType}`);
        }
      });

      // Navigate to URL with timeout
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: SCRAPING_CONFIG.requestTimeout
      });

      // Wait for content to load
      await page.waitForSelector('body');

      // Get page content
      const content = await page.content();
      const extractedContent = this.contentExtractor.extract(content, url);

      await page.close();
      this.rateLimiter.release(url);

      return {
        url,
        depth: 0,
        content: extractedContent
      };
    } catch (error) {
      this.rateLimiter.release(url);
      throw error;
    }
  }

  async scrape(
    url: string,
    depth: number = 1,
    maxPages: number = SCRAPING_CONFIG.maxPages
  ): Promise<ScrapedPage[]> {
    this.visitedUrls.clear();
    this.updateProgress({
      pagesScraped: 0,
      totalPages: 1, // Start with at least 1 page
      currentUrl: url,
      status: 'scraping'
    });

    try {
      const robotsRules = await this.robotsParser.getRobotsRules(url);
      const results: ScrapedPage[] = [];
      const queue: Array<{ url: string; depth: number }> = [{ url, depth: 0 }];

      while (queue.length > 0 && results.length < maxPages) {
        const current = queue.shift()!;
        
        if (this.visitedUrls.has(current.url)) {
          continue;
        }

        this.visitedUrls.add(current.url);
        this.updateProgress({ currentUrl: current.url });

        try {
          const scrapedPage = await this.fetchPage(current.url, robotsRules);
          results.push(scrapedPage);
          
          this.updateProgress({
            pagesScraped: results.length,
            totalPages: Math.min(
              this.visitedUrls.size + queue.length,
              maxPages
            )
          });

          // Add new URLs to queue if within depth limit
          if (current.depth < depth) {
            const newUrls = scrapedPage.content.links
              .filter(link => {
                const linkUrl = new URL(link);
                const currentUrl = new URL(current.url);
                return linkUrl.hostname === currentUrl.hostname;
              })
              .filter(link => !this.visitedUrls.has(link))
              .map(link => ({
                url: link,
                depth: current.depth + 1
              }));

            queue.push(...newUrls);
            
            this.updateProgress({
              totalPages: Math.min(
                this.visitedUrls.size + queue.length,
                maxPages
              )
            });
          }
        } catch (error) {
          logger.error(`Error scraping ${current.url}:`, error);
          results.push({
            url: current.url,
            depth: current.depth,
            content: {
              title: '',
              content: '',
              metadata: {},
              images: [],
              links: []
            },
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.updateProgress({ status: 'completed' });
      return results;
    } catch (error) {
      this.updateProgress({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
} 