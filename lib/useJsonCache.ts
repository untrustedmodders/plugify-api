import { ref, onMounted } from 'vue';
import { getFromCache, saveToCache } from './indexedDb';

export function useJsonCache<T>(
    initialUrls: Record<string, string>,
    onDataLoaded?: (key: string, data: T) => void,
    onDataUpdated?: (key: string, data: T) => void
) {
    const urls = ref<Record<string, string>>(initialUrls);
    const data = ref<Record<string, T | null>>({});
    const isUpdating = ref<Record<string, boolean>>({});

    /**
     * Load multiple cached JSONs from IndexedDB.
     */
    async function loadFromCache() {
        for (const key of Object.keys(urls.value)) {
            const cachedData = await getFromCache<T>(key);
            if (cachedData) {
                data.value[key] = cachedData;
                onDataLoaded?.(key, cachedData); // Call callback
                console.debug("Successfully load from cache");
            }
        }
    }

    /**
     * Fetch and update multiple JSON files.
     */
    async function fetchAndUpdate() {
        for (const [key, url] of Object.entries(urls.value)) {
            isUpdating.value[key] = true;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${key}`);

                const newData: T = await response.json();
                data.value[key] = newData;
                await saveToCache<T>(key, newData);
                onDataUpdated?.(key, newData); // Call callback
                console.debug("Successfully updated data");
            } catch (error) {
                console.error(`Error fetching ${key}:`, error);
            }
            isUpdating.value[key] = false;
        }
    }

    /**
     * Add a new JSON link dynamically.
     * @param key The unique cache key for the new JSON.
     * @param url The URL of the new JSON file.
     */
    function addLink(key: string, url: string) {
        // Add the new link to the `urls` object.
        urls.value[key] = url;
        // Fetch and update the new URL's data.
        fetchAndUpdate();
    }

    /**
     * Initialize: Load from cache and fetch new data asynchronously.
     */
    async function init() {
        await loadFromCache(); // Load all cached data first
        fetchAndUpdate(); // Fetch all latest data in background
    }

    onMounted(init);

    return { data, isUpdating, fetchAndUpdate, addLink };
}
