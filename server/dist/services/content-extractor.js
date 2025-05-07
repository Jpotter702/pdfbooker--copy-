"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentExtractor = void 0;
const cheerio = __importStar(require("cheerio"));
const config_1 = require("../config");
class ContentExtractor {
    extract(html, baseUrl) {
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
    removeUnwantedElements($) {
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
    extractTitle($) {
        // Try different title sources in order of preference
        return ($('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('h1').first().text() ||
            $('title').text() ||
            '').trim();
    }
    extractMetadata($) {
        return {
            description: ($('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                '').trim(),
            author: ($('meta[name="author"]').attr('content') ||
                $('meta[property="article:author"]').attr('content') ||
                '').trim(),
            publishDate: ($('meta[property="article:published_time"]').attr('content') ||
                $('time[pubdate]').attr('datetime') ||
                '').trim(),
            modifiedDate: ($('meta[property="article:modified_time"]').attr('content') ||
                $('time[datetime]').attr('datetime') ||
                '').trim()
        };
    }
    extractMainContent($) {
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
            if ($main.length > 0)
                break;
        }
        // If no main content container found, use body
        if ($main.length === 0) {
            $main = $('body');
        }
        // Clean up the content
        this.cleanContent($main);
        return $main.text().trim();
    }
    cleanContent($elem) {
        // Remove empty elements
        $elem.find(':empty').not('img, br, hr, input, textarea').remove();
        // Normalize whitespace
        $elem.find('*').each((_, elem) => {
            var _a;
            const contents = (_a = elem.children) === null || _a === void 0 ? void 0 : _a.filter((child) => child.type === 'text' && typeof child.data === 'string');
            if (contents && contents.length > 0) {
                for (const content of contents) {
                    content.data = content.data.replace(/\s+/g, ' ').trim();
                }
            }
        });
    }
    extractImages($, baseUrl) {
        const images = [];
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
                }
                catch (error) {
                    config_1.logger.warn(`Failed to process image URL: ${src}`, error);
                }
            }
        });
        return images;
    }
    extractLinks($, baseUrl) {
        const links = [];
        $('a[href]').each((_, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                try {
                    const url = new URL(href, baseUrl).href;
                    if (url.startsWith('http')) {
                        links.push(url);
                    }
                }
                catch (error) {
                    config_1.logger.warn(`Failed to process link URL: ${href}`, error);
                }
            }
        });
        return [...new Set(links)]; // Remove duplicates
    }
}
exports.ContentExtractor = ContentExtractor;
//# sourceMappingURL=content-extractor.js.map