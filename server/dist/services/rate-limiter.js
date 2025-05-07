"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor() {
        this.domains = new Map();
    }
    async acquire(url, delay) {
        const domain = new URL(url).origin;
        if (!this.domains.has(domain)) {
            this.domains.set(domain, {
                lastRequest: 0,
                queue: [],
                isProcessing: false
            });
        }
        const entry = this.domains.get(domain);
        return new Promise((resolve) => {
            // Add request to queue
            entry.queue.push(async () => {
                const now = Date.now();
                const timeSinceLastRequest = now - entry.lastRequest;
                if (timeSinceLastRequest < delay * 1000) {
                    // Wait for the remaining delay
                    await new Promise(r => setTimeout(r, delay * 1000 - timeSinceLastRequest));
                }
                entry.lastRequest = Date.now();
                resolve();
            });
            // Process queue if not already processing
            if (!entry.isProcessing) {
                this.processQueue(domain);
            }
        });
    }
    async processQueue(domain) {
        const entry = this.domains.get(domain);
        entry.isProcessing = true;
        while (entry.queue.length > 0) {
            const request = entry.queue.shift();
            await request();
        }
        entry.isProcessing = false;
    }
    release(url) {
        const domain = new URL(url).origin;
        const entry = this.domains.get(domain);
        if (entry) {
            entry.lastRequest = Date.now();
        }
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rate-limiter.js.map