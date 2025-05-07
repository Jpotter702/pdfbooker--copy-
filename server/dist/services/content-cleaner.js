"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentCleaner = void 0;
const readability_1 = require("@mozilla/readability");
const jsdom_1 = require("jsdom");
const logger_1 = require("../utils/logger");
class ContentCleaner {
    constructor() { }
    /**
     * Cleans and extracts content from HTML
     * @param html The HTML content to clean
     * @param url The URL of the page (for resolving relative URLs)
     * @returns Cleaned content with metadata
     */
    async clean(html, url) {
        try {
            // Create a DOM from the HTML
            const dom = new jsdom_1.JSDOM(html, {
                url,
                runScripts: 'dangerously',
                resources: 'usable',
            });
            // Remove unwanted elements before readability processing
            this.removeUnwantedElements(dom.window.document);
            // Process with Readability
            const reader = new readability_1.Readability(dom.window.document);
            const article = reader.parse();
            if (!article) {
                throw new Error('Failed to extract content with Readability');
            }
            // Extract images and links
            const images = this.extractImages(dom.window.document, url);
            const links = this.extractLinks(dom.window.document, url);
            // Normalize content
            const normalizedContent = this.normalizeContent(article.content || '');
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
        }
        catch (error) {
            logger_1.logger.error('Error cleaning content:', error);
            throw error;
        }
    }
    /**
     * Removes unwanted elements from the document
     * @param document The document to clean
     */
    removeUnwantedElements(document) {
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
    extractImages(document, baseUrl) {
        const images = [];
        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (!src)
                return;
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
    extractLinks(document, baseUrl) {
        const links = [];
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href)
                return;
            try {
                const url = new URL(href, baseUrl).toString();
                links.push(url);
            }
            catch (error) {
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
    normalizeContent(content) {
        // Create a temporary DOM to manipulate the content
        const dom = new jsdom_1.JSDOM(content);
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
    normalizeHeadings(document) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentLevel = 1;
        headings.forEach(heading => {
            var _a;
            const level = parseInt(heading.tagName[1]);
            if (level > currentLevel + 1) {
                // Skip levels to maintain hierarchy
                currentLevel = level - 1;
            }
            // Create a new heading element with the correct level
            const newHeading = document.createElement(`h${currentLevel}`);
            newHeading.innerHTML = heading.innerHTML;
            (_a = heading.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newHeading, heading);
            currentLevel++;
        });
    }
    /**
     * Cleans up whitespace in the document
     * @param document The document to clean
     */
    cleanWhitespace(document) {
        // Remove empty elements
        document.querySelectorAll('*').forEach(element => {
            var _a;
            if (!((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) && !element.querySelector('img')) {
                element.remove();
            }
        });
        // Normalize whitespace in text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
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
    convertRelativeUrls(document) {
        const elements = document.querySelectorAll('[src], [href]');
        elements.forEach(element => {
            const src = element.getAttribute('src');
            const href = element.getAttribute('href');
            if (src) {
                try {
                    const url = new URL(src, document.baseURI).toString();
                    element.setAttribute('src', url);
                }
                catch (error) {
                    // Skip invalid URLs
                }
            }
            if (href) {
                try {
                    const url = new URL(href, document.baseURI).toString();
                    element.setAttribute('href', url);
                }
                catch (error) {
                    // Skip invalid URLs
                }
            }
        });
    }
}
exports.ContentCleaner = ContentCleaner;
//# sourceMappingURL=content-cleaner.js.map