import { defineStore } from 'pinia'
import { openDB } from 'idb';
import type {
    EnumMap,
    MethodMap,
    ClassMap,

    EnumType,
    ManifestType,
    MethodType,
    ParamType,

    ClassType,
} from '~/lib/manifest';

// Add new constants for cache expiration (in milliseconds) and database version
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours for example
const DB_VERSION = 3; // Increment the version when schema changes

// Default manifest URLs for first-time users
const DEFAULT_MANIFEST_URLS = [
    'https://raw.githubusercontent.com/untrustedmodders/plugify-plugin-s2sdk/refs/heads/main/plugify-plugin-s2sdk.pplugin.in',
    'https://raw.githubusercontent.com/untrustedmodders/plugify-plugin-polyhook/refs/heads/main/plugify-plugin-polyhook.pplugin.in',
    'https://raw.githubusercontent.com/untrustedmodders/plugify-plugin-dyncall/refs/heads/main/plugify-plugin-dyncall.pplugin.in',
    'https://raw.githubusercontent.com/untrustedmodders/plugify-plugin-configs/refs/heads/main/plugify-plugin-configs.pplugin.in',
];

function ProcessItem(
    param: ParamType,
    delgs: MethodMap,
    enums: EnumMap
): void {
    if (param.prototype && param.prototype.name) {
        if (!delgs[param.prototype.name]) {
            delgs[param.prototype.name] = param.prototype;
        }
        ProcessMethod(param.prototype, delgs, enums);
    } else if (param.enum && param.enum.name) {
        if (!enums[param.enum.name] && param.enum.values) {
            enums[param.enum.name] = param.enum;
        }
    }
}

function ProcessMethod(
    method: MethodType,
    delgs: MethodMap,
    enums: EnumMap
): void {
    method.paramTypes?.forEach(param => {
        ProcessItem(param, delgs, enums);
    });
    if (method.retType) {
        ProcessItem(method.retType, delgs, enums);
    }
}

export type Item = {
    url: string;
    name: string;
    link: string;
    icon: number;
}

type Content = {
    methods: MethodMap;
    delegates: MethodMap;
    enumerators: EnumMap;
    classes: ClassMap;
}

type Document = Record<string, Content>;

function formatUrl(url: string) {
    if (url.includes('://github.com')) {
        return url
            .replace('://github.com', '://raw.githubusercontent.com')
            .replace('/blob/', '/refs/heads/');
    }
    return url;
}

export function formatName(url: string) {
    const parts = url.split('/');
    const filename = parts.pop() || ''; // Ensure it's a string
    return filename.split('.')[0]; // Remove file extension
}

export const useDocStore = defineStore('docStore', {
    state: () => ({
        db: null as any,

        docs: {} as Record<string, Document>,
        docUrls: [] as string[],

        isRefreshing: {} as Record<string, boolean>,
        isInvalid: {} as Record<string, boolean>,

        selectedDocUrl: '',
        selectedDoc: {} as Document,

        selectedGroup: '',
        selectedItem: '',

        fragments: [] as string[],
        foundMethod: null as MethodType | null,
        foundDelegate: null as MethodType | null,
        foundEnum: null as EnumType | null,
        foundClass: null as ClassType | null
    }),
    actions: {
        async initDB(selectedDocUrl: any) {
            this.db = await openDB('docCacheDB', DB_VERSION, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion < 1) {
                        console.log("First time database creation");
                    }

                    if (oldVersion < DB_VERSION) {
                        if (db.objectStoreNames.contains('docFiles')) {
                            console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
                            db.deleteObjectStore('docFiles');
                        }
                        db.createObjectStore('docFiles');
                    }
                },
            });

            this.docUrls = JSON.parse(localStorage.getItem('docUrls') || '[]')

            // If first-time user (no manifests), add default manifests
            if (this.docUrls.length === 0) {
                this.docUrls = [...DEFAULT_MANIFEST_URLS];
                localStorage.setItem('docUrls', JSON.stringify(this.docUrls));
            }

            if (selectedDocUrl) {
                this.addDocUrl(selectedDocUrl);
            }
            this.selectedDocUrl = selectedDocUrl || localStorage.getItem('selectedDocUrl') || '';
            this.selectedDoc = this.docs[this.selectedDocUrl];
            localStorage.setItem('selectedDocUrl', this.selectedDocUrl);
            this.loadDoc(this.selectedDocUrl);
        },

        async loadDoc(url: string) {
            if (url.length == 0)
                return;

            const cached = await this.getCachedDoc(url);
            const isOutdated = cached && this.isCacheOutdated(cached.timestamp);

            if (cached && !isOutdated) {
                this.onDataUpdated(url, cached.data);
                console.debug('Successfully loaded from cache');
                return;
            }

            // Start refresh in the background, if not already refreshing
            this.refreshDoc(url);
        },

        refreshDoc(url: string) {
            if (!this.isRefreshing[url]) {
                this.isRefreshing[url] = true;
                this.refreshDocInBackground(url);
            }
        },

        async refreshDocInBackground(url: string) {
            try {
                const response: Response = await fetch(url);
                const manifest: ManifestType = await response.json();

                let data: Document = {};

                if (manifest.methods !== undefined) {
                    const methodMap: Record<string, MethodMap> = manifest.methods.reduce((acc: Record<string, MethodMap>, item: MethodType) => {
                        const group = item.group || manifest.name || '';
                        if (!acc[group]) {
                            acc[group] = {};
                        }
                        acc[group][item.name || ''] = item;
                        return acc;
                    }, {});

                    for (const [group, methods] of Object.entries(methodMap)) {
                        let delegates: MethodMap = {};
                        let enumerators: EnumMap = {};
                        for (const method of Object.values(methods)) {
                            ProcessMethod(method, delegates, enumerators);
                        }
                        data[group] = {
                            methods: methods,
                            delegates: delegates,
                            enumerators: enumerators,
                            classes: {}
                        };
                    }
                    this.isInvalid[url] = false;
                } else {
                    this.isInvalid[url] = true;
                }

                if (manifest.classes !== undefined) {
                    const classMap: Record<string, ClassMap> = manifest.classes.reduce((acc: Record<string, ClassMap>, item: ClassType) => {
                        const group = item.group || manifest.name || '';
                        if (!acc[group]) {
                            acc[group] = {};
                        }
                        acc[group][item.name || ''] = item;
                        return acc;
                    }, {});

                    for (const [group, classes] of Object.entries(classMap)) {
                        const entry = data[group];
                        if (entry) {
                            entry.classes = classes;
                        }
                    }
                }

                await this.setCacheDoc(url, data);
                this.onDataUpdated(url, data);
                console.debug('Successfully updated data');
            } catch (error) {
                console.error(`Error refreshing doc ${url}:`, error);
                this.isInvalid[url] = true;
            }

            this.isRefreshing[url] = false;
        },

        async setCacheDoc(url: string, data: Document) {
            try {
                const timestamp = Date.now();
                const tx = this.db.transaction('docFiles', 'readwrite');
                const store = tx.objectStore('docFiles');
                await store.put({ data, timestamp }, url);
                await tx.done;
            } catch (error) {
                console.error('Error caching document:', error);
            }
        },

        async getCachedDoc(url: string) {
            try {
                const tx = this.db.transaction('docFiles', 'readonly');
                const store = tx.objectStore('docFiles');
                return await store.get(url);
            } catch (error) {
                console.error('Error retrieving cached document:', error);
                return null;
            }
        },

        isCacheOutdated(timestamp: number): boolean {
            const currentTime = Date.now();
            return currentTime - timestamp > CACHE_EXPIRATION_TIME;
        },

        selectDoc(url: string) {
            this.selectedDocUrl = url;
            this.selectedDoc = this.docs[this.selectedDocUrl];
            localStorage.setItem('selectedDocUrl', url);

            this.selectedGroup = '';
            this.selectedItem = '';
            this.foundMethod = null;
            this.foundDelegate = null;
            this.foundEnum = null;
            this.foundClass = null;

            this.loadDoc(url);
        },

        addDocUrl(url: string) {
            try {
                const u = new URL(formatUrl(url));
                if ((u.protocol === "http:" || u.protocol === "https:") && !this.docUrls.includes(u.href)) {
                    this.docUrls.push(u.href);
                    localStorage.setItem('docUrls', JSON.stringify(this.docUrls));
                    return true;
                }
            } catch (error) {
                console.error('Invalid url:', error);
            }
            return false;
        },

        removeDocUrl(url: string) {
            this.docUrls = this.docUrls.filter(u => u !== url);
            localStorage.setItem('docUrls', JSON.stringify(this.docUrls));

            const current = this.selectedDocUrl === url;
            if (current) {
                delete this.docs[this.selectedDocUrl];
                this.selectedDocUrl = '';
                this.selectedDoc = {};

                this.selectedGroup = '';
                this.selectedItem = '';
                this.foundMethod = null;
                this.foundDelegate = null;
                this.foundEnum = null;
                this.foundClass = null;

                localStorage.removeItem('selectedDocUrl');
            }
            return current;
        },

        async searchContent(value: string) {
            return new Promise<Item[]>((resolve) => {
                setTimeout(() => {
                    let found: Item[] = [];
                    for (const url of this.docUrls) {
                        if (url.includes(value)) {
                            found.push({ url: url, name: '', link: '#/', icon: 0 });
                        }
                        const data = this.docs[url];
                        if (data) {
                            for (const [group, content] of Object.entries(data)) {
                                if (group.includes(value)) {
                                    found.push({ url: url, name: group, link: `#/${group}`, icon: 1 });
                                }
                                for (const name of Object.keys(content.methods)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 2 });
                                    }
                                }
                                for (const name of Object.keys(content.delegates)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 3 });
                                    }
                                }
                                for (const name of Object.keys(content.enumerators)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 4 });
                                    }
                                }
                                for (const name of Object.keys(content.classes)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 5 });
                                    }
                                }
                            }
                        }
                    }
                    resolve(found);
                }, 0); // Pushes execution to the next event loop cycle
            });
        },

        onRouteChange(hash: string) {
            this.fragments = hash
                .replace(/^#\//, "")
                .split("/")
                .map(segment => segment.trim())
                .filter(segment => /^[a-zA-Z0-9-_${}]+$/.test(segment));

            switch (this.fragments.length) {
                case 1:
                    this.selectedGroup = this.fragments[0];
                    this.selectedItem = '';
                    break;
                case 2:
                    this.selectedGroup = this.fragments[0];
                    this.selectedItem = this.fragments[1];
                    break;
                default:
                    return;
            }

            this.updateSelection();
        },

        updateSelection() {
            if (this.selectedDoc) {
                let group = this.selectedDoc[this.selectedGroup];
                if (group !== undefined) {
                    this.foundMethod = group.methods[this.selectedItem];
                    this.foundDelegate = group.delegates[this.selectedItem];
                    this.foundEnum = group.enumerators[this.selectedItem];
                    this.foundClass = group.classes[this.selectedItem];
                    return;
                }
            }
            this.foundMethod = null;
            this.foundDelegate = null;
            this.foundEnum = null;
            this.foundClass = null;
        },

        onDataUpdated(url: string, data: Document) {
            this.docs[url] = data;
            this.selectedDoc = data;
            this.updateSelection();
        }
    },
})


