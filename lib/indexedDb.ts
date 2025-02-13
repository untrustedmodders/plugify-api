import { openDB } from 'idb';

const DB_NAME = 'jsonCacheDB';
const STORE_NAME = 'jsonFiles';

/**
 * Initialize IndexedDB and return the database instance.
 */
async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
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
    const db = await getDB();
    await db.put(STORE_NAME, data, key);
}

/**
 * Retrieve data from IndexedDB.
 * @param key The cache key.
 * @returns The cached data or null if not found.
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
    const db = await getDB();
    return (await db.get(STORE_NAME, key)) as T | null;
}
