"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScraper = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const config_1 = require("../config");
const config_2 = require("../config");
const robots_parser_1 = require("./robots-parser");
const rate_limiter_1 = require("./rate-limiter");
const content_extractor_1 = require("./content-extractor");
class WebScraper {
    constructor() {
        this.visitedUrls = new Set();
        this.browser = null;
        this.robotsParser = new robots_parser_1.RobotsParser();
        this.rateLimiter = new rate_limiter_1.RateLimiter();
        this.contentExtractor = new content_extractor_1.ContentExtractor();
        this.progress = {
            pagesScraped: 0,
            totalPages: 0,
            currentUrl: '',
            status: 'initializing'
        };
    }
    setProgressCallback(callback) {
        this.onProgressUpdate = callback;
    }
    updateProgress(update) {
        this.progress = { ...this.progress, ...update };
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.progress);
        }
    }
    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer_1.default.launch({
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
    async fetchPage(url, robotsRules) {
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
            await page.setUserAgent(config_2.SCRAPING_CONFIG.userAgent);
            // Set reasonable viewport
            await page.setViewport({ width: 1280, height: 800 });
            // Handle different content types
            page.on('response', async (response) => {
                const contentType = response.headers()['content-type'];
                if (contentType && !contentType.includes('text/html')) {
                    config_1.logger.info(`Skipping non-HTML content: ${url} (${contentType})`);
                    throw new Error(`Unsupported content type: ${contentType}`);
                }
            });
            // Navigate to URL with timeout
            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: config_2.SCRAPING_CONFIG.requestTimeout
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
        }
        catch (error) {
            this.rateLimiter.release(url);
            throw error;
        }
    }
    async scrape(url, depth = 1, maxPages = config_2.SCRAPING_CONFIG.maxPages) {
        this.visitedUrls.clear();
        this.updateProgress({
            pagesScraped: 0,
            totalPages: 1, // Start with at least 1 page
            currentUrl: url,
            status: 'scraping'
        });
        try {
            const robotsRules = await this.robotsParser.getRobotsRules(url);
            const results = [];
            const queue = [{ url, depth: 0 }];
            while (queue.length > 0 && results.length < maxPages) {
                const current = queue.shift();
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
                        totalPages: Math.min(this.visitedUrls.size + queue.length, maxPages)
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
                            totalPages: Math.min(this.visitedUrls.size + queue.length, maxPages)
                        });
                    }
                }
                catch (error) {
                    config_1.logger.error(`Error scraping ${current.url}:`, error);
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
        }
        catch (error) {
            this.updateProgress({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}
exports.WebScraper = WebScraper;
//# sourceMappingURL=scraper.js.map