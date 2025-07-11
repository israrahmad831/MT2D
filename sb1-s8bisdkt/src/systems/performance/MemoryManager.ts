export class MemoryManager {
  private static readonly CACHE_SIZE = 100;
  private static readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private static imageCache: Map<string, HTMLImageElement> = new Map();
  private static lastCleanup = Date.now();
  private static lastAccessTimes: Map<string, number> = new Map();

  static preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      this.lastAccessTimes.set(url, Date.now());
      return Promise.resolve(this.imageCache.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (this.imageCache.size >= this.CACHE_SIZE) {
          this.cleanup();
        }
        this.imageCache.set(url, img);
        this.lastAccessTimes.set(url, Date.now());
        resolve(img);
      };
      img.onerror = reject;
    });
  }

  static getImage(url: string): HTMLImageElement | undefined {
    const img = this.imageCache.get(url);
    if (img) {
      this.lastAccessTimes.set(url, Date.now());
    }
    return img;
  }

  private static cleanup() {
    const now = Date.now();
    
    // Only cleanup if enough time has passed
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    // Sort by last access time
    const entries = Array.from(this.lastAccessTimes.entries())
      .sort(([, timeA], [, timeB]) => timeA - timeB);

    // Remove oldest entries until we're under the cache size limit
    while (this.imageCache.size > this.CACHE_SIZE) {
      const [oldestUrl] = entries.shift()!;
      this.imageCache.delete(oldestUrl);
      this.lastAccessTimes.delete(oldestUrl);
    }

    this.lastCleanup = now;
  }

  static clearCache() {
    this.imageCache.clear();
    this.lastAccessTimes.clear();
  }

  static getCacheStats() {
    return {
      size: this.imageCache.size,
      lastCleanup: this.lastCleanup,
      oldestEntry: Math.min(...this.lastAccessTimes.values()),
      newestEntry: Math.max(...this.lastAccessTimes.values())
    };
  }
}