import { openDB } from 'idb';

const DB_NAME = 'docCacheDB';
const STORE_NAME = 'docFiles';

/**
 * Initialize IndexedDB and return the database instance.
 * @param name The db name.
 * @param store The store name.
 */
export async function getDB(name: string, store: string) {
    return openDB(name, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store);
            }
        },
    });
}

/**
 * Save data to IndexedDB.
 * @param key The cache key.
 * @param data The JSON data to store.
 */
export async function saveToCache<T>(key: string, data: T): Promise<void> {
    const db = await getDB(DB_NAME, STORE_NAME);
    await db.put(STORE_NAME, data, key);
}

/**
 * Retrieve data from IndexedDB.
 * @param key The cache key.
 * @returns The cached data or null if not found.
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
    const db = await getDB(DB_NAME, STORE_NAME);
    return (await db.get(STORE_NAME, key)) as T | null;
}
