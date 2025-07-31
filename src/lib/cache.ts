export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/** Generic reusable cache class */
export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  private isCacheValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.ttl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }
    return null;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}
