"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentOrganizer = void 0;
const jsdom_1 = require("jsdom");
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class ContentOrganizer {
    constructor() {
        this.imageCache = new Map();
        this.maxImageSize = 5 * 1024 * 1024; // 5MB
    }
    /**
     * Organizes scraped content into a structured format
     * @param pages Array of scraped pages
     * @returns Organized content with table of contents and images
     */
    async organize(pages) {
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
        }
        catch (error) {
            logger_1.logger.error('Error organizing content:', error);
            throw error;
        }
    }
    /**
     * Sorts pages by depth and URL
     * @param pages Array of scraped pages
     * @returns Sorted array of pages
     */
    sortPages(pages) {
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
    async downloadImages(pages) {
        const imageUrls = new Set();
        // Collect unique image URLs
        pages.forEach(page => {
            var _a;
            if ((_a = page.content) === null || _a === void 0 ? void 0 : _a.images) {
                page.content.images.forEach((image) => {
                    imageUrls.add(image.url);
                });
            }
        });
        // Download images in parallel
        await Promise.all(Array.from(imageUrls).map(url => this.downloadImage(url)));
    }
    /**
     * Downloads a single image
     * @param url Image URL
     */
    async downloadImage(url) {
        if (this.imageCache.has(url)) {
            return;
        }
        try {
            const response = await axios_1.default.get(url, {
                responseType: 'arraybuffer',
                maxContentLength: this.maxImageSize,
            });
            if (response.status === 200) {
                this.imageCache.set(url, Buffer.from(response.data));
            }
        }
        catch (error) {
            logger_1.logger.warn(`Failed to download image: ${url}`, error);
        }
    }
    /**
     * Processes pages to resolve links and organize content
     * @param pages Array of scraped pages
     * @returns Array of organized pages
     */
    async processPages(pages) {
        return pages.map((page, index) => {
            var _a, _b;
            const dom = new jsdom_1.JSDOM(((_a = page.content) === null || _a === void 0 ? void 0 : _a.content) || '');
            const document = dom.window.document;
            // Resolve links
            this.resolveLinks(document, pages);
            // Add page transitions
            this.addPageTransitions(document, index, pages.length);
            return {
                title: ((_b = page.content) === null || _b === void 0 ? void 0 : _b.title) || `Page ${index + 1}`,
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
    resolveLinks(document, pages) {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href)
                return;
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
    addPageTransitions(document, currentIndex, totalPages) {
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
    generateTableOfContents(pages) {
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
    getMainTitle(pages) {
        var _a;
        // Use the title of the first page (usually the main page)
        return ((_a = pages[0]) === null || _a === void 0 ? void 0 : _a.title) || 'PDF Book';
    }
}
exports.ContentOrganizer = ContentOrganizer;
//# sourceMappingURL=content-organizer.js.map