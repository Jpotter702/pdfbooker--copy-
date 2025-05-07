"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotsParser = void 0;
const config_1 = require("../config");
class RobotsParser {
    constructor() {
        this.cache = {};
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }
    async getRobotsRules(url) {
        const domain = new URL(url).origin;
        const now = new Date();
        // Check cache
        if (this.cache[domain] &&
            (now.getTime() - this.cache[domain].lastFetched.getTime()) < this.cacheExpiry) {
            return this.cache[domain].rules;
        }
        try {
            const robotsUrl = `${domain}/robots.txt`;
            const response = await fetch(robotsUrl);
            if (!response.ok) {
                config_1.logger.warn(`No robots.txt found at ${domain}, using default rules`);
                return this.getDefaultRules();
            }
            const content = await response.text();
            const rules = this.parseRobotsContent(content);
            // Cache the rules
            this.cache[domain] = {
                rules,
                lastFetched: now
            };
            return rules;
        }
        catch (error) {
            config_1.logger.error(`Error fetching robots.txt from ${domain}:`, error);
            return this.getDefaultRules();
        }
    }
    parseRobotsContent(content) {
        const rules = {
            allowedPaths: [],
            disallowedPaths: [],
            crawlDelay: 1 // Default 1 second
        };
        const lines = content.split('\n');
        let isRelevantUserAgent = false;
        for (const line of lines) {
            const [directive, ...valueParts] = line.split(':').map(part => part.trim());
            const value = valueParts.join(':').trim();
            if (directive.toLowerCase() === 'user-agent') {
                // Check if this section applies to us or all agents
                isRelevantUserAgent = value === '*' || value.toLowerCase() === 'pdfbooker';
                continue;
            }
            if (!isRelevantUserAgent)
                continue;
            switch (directive.toLowerCase()) {
                case 'allow':
                    if (value)
                        rules.allowedPaths.push(value);
                    break;
                case 'disallow':
                    if (value)
                        rules.disallowedPaths.push(value);
                    break;
                case 'crawl-delay':
                    const delay = parseFloat(value);
                    if (!isNaN(delay))
                        rules.crawlDelay = delay;
                    break;
            }
        }
        return rules;
    }
    getDefaultRules() {
        return {
            allowedPaths: ['/'],
            disallowedPaths: [],
            crawlDelay: 1
        };
    }
    isPathAllowed(url, rules) {
        const { pathname } = new URL(url);
        // Check if path matches any disallowed pattern
        for (const disallowed of rules.disallowedPaths) {
            if (this.pathMatches(pathname, disallowed)) {
                return false;
            }
        }
        // Check if path matches any allowed pattern
        for (const allowed of rules.allowedPaths) {
            if (this.pathMatches(pathname, allowed)) {
                return true;
            }
        }
        // If no explicit allow found, allow by default if there are no disallow rules
        return rules.disallowedPaths.length === 0;
    }
    pathMatches(pathname, pattern) {
        // Convert robots.txt pattern to regex
        const regex = new RegExp('^' + pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '\\?')
            .replace(/\./g, '\\.')
            .replace(/\$/g, '\\$') +
            (pattern.endsWith('$') ? '' : '.*'));
        return regex.test(pathname);
    }
}
exports.RobotsParser = RobotsParser;
//# sourceMappingURL=robots-parser.js.map