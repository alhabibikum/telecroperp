/**
 * TeleCorp ERP - High-Performance IndexedDB Storage Service
 * Replaces localStorage (5MB limit) with IndexedDB (hundreds of MBs capacity).
 * Provides seamless migration from localStorage with fallback safety.
 */

const DB_NAME = 'TeleCorpERP_DB';
const DB_VERSION = 1;
const STORE_NAME = 'erp_store';

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isAvailable: boolean = true;

  constructor() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isAvailable = false;
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isAvailable) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('IndexedDB open error:', request.error);
          this.isAvailable = false;
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('IndexedDB database open blocked by another tab');
        };
      } catch (err) {
        this.isAvailable = false;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Get an item by key from IndexedDB, with fallback to localStorage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      if (this.isAvailable) {
        const db = await this.getDB();
        return await new Promise<T | null>((resolve) => {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onsuccess = () => {
            if (request.result !== undefined && request.result !== null) {
              resolve(request.result as T);
            } else {
              // Try fallback to localStorage for legacy data
              try {
                const legacy = localStorage.getItem(key);
                if (legacy) {
                  const parsed = JSON.parse(legacy) as T;
                  // Asynchronously migrate to IndexedDB
                  this.setItem(key, parsed).catch(console.error);
                  resolve(parsed);
                  return;
                }
              } catch {
                // Ignore parse errors
              }
              resolve(null);
            }
          };

          request.onerror = () => {
            console.error(`IndexedDB getItem failed for key: ${key}`, request.error);
            resolve(this.getLocalStorageFallback<T>(key));
          };
        });
      }
    } catch (e) {
      console.warn(`IndexedDB unavailable, falling back to localStorage for ${key}:`, e);
    }

    return this.getLocalStorageFallback<T>(key);
  }

  /**
   * Save an item by key into IndexedDB
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (this.isAvailable) {
        const db = await this.getDB();
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, key);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        // Also update timestamp heartbeat in localStorage (takes <50 bytes)
        try {
          localStorage.setItem(`${key}_LAST_SAVED`, Date.now().toString());
        } catch {
          // Ignore
        }
        return;
      }
    } catch (e) {
      console.warn(`IndexedDB save failed for ${key}, falling back to localStorage:`, e);
    }

    // Fallback if IndexedDB fails
    this.setLocalStorageFallback(key, value);
  }

  /**
   * Delete an item from IndexedDB and localStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isAvailable) {
        const db = await this.getDB();
        await new Promise<void>((resolve) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      }
    } catch {
      // Ignore
    }

    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_LAST_SAVED`);
    } catch {
      // Ignore
    }
  }

  /**
   * Clear all stored ERP data in IndexedDB
   */
  async clear(): Promise<void> {
    try {
      if (this.isAvailable) {
        const db = await this.getDB();
        await new Promise<void>((resolve) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      }
    } catch {
      // Ignore
    }
  }

  private getLocalStorageFallback<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Ignore
    }
    return null;
  }

  private setLocalStorageFallback<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`localStorage quota exceeded or write failed for ${key}:`, e);
    }
  }
}

export const erpStorage = new IndexedDBStorage();
