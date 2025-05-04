interface RateLimiterEntry {
  lastRequest: number;
  queue: Array<() => Promise<void>>;
  isProcessing: boolean;
}

export class RateLimiter {
  private domains: Map<string, RateLimiterEntry> = new Map();

  async acquire(url: string, delay: number): Promise<void> {
    const domain = new URL(url).origin;
    
    if (!this.domains.has(domain)) {
      this.domains.set(domain, {
        lastRequest: 0,
        queue: [],
        isProcessing: false
      });
    }

    const entry = this.domains.get(domain)!;
    
    return new Promise<void>((resolve) => {
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

  private async processQueue(domain: string): Promise<void> {
    const entry = this.domains.get(domain)!;
    entry.isProcessing = true;

    while (entry.queue.length > 0) {
      const request = entry.queue.shift()!;
      await request();
    }

    entry.isProcessing = false;
  }

  release(url: string): void {
    const domain = new URL(url).origin;
    const entry = this.domains.get(domain);
    
    if (entry) {
      entry.lastRequest = Date.now();
    }
  }
} 