import { defineStore } from 'pinia'
import { openDB } from 'idb';
import type {
    EnumMap,
    MethodMap,

    EnumType,
    ManifestType,
    MethodType,
    ParamType
} from './manifest';

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
    icon: string;
}

type Content = {
    methods: MethodMap;
    delegates: MethodMap;
    enumerators: EnumMap;
}

type Document = Record<string, Content>;

function getUrl(url: string) {
    if (url.includes('://github.com')) {
        return url
            .replace('://github.com', '://raw.githubusercontent.com')
            .replace('/blob/', '/refs/heads/');
    }
    return url;
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

        querySearch: '',
        searchMode: false,

        fragments: [] as string[],
        foundMode: false,
        foundMethod: {} as MethodType,
        foundDelegate: {} as MethodType,
        foundEnum: {} as EnumType
    }),
    actions: {
        async initDB(selectedDocUrl: any) {
            this.db = await openDB('docCacheDB', 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('docFiles')) {
                        db.createObjectStore('docFiles');
                    }
                },
            });

            this.docUrls = JSON.parse(localStorage.getItem('docUrls') || '[]')
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
            if (cached) {
                this.onDataUpdated(url, cached);
                console.debug('Successfully load from cache');
                return; // TODO: finish refresh
            }

            // Start refresh in the background, if not already refreshing
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

                if (manifest.exportedMethods !== undefined) {
                    const methodMap: Record<string, MethodMap> = manifest.exportedMethods.reduce((acc: Record<string, MethodMap>, item: MethodType) => {
                        const group = item.group || manifest.friendlyName || '';
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
                            enumerators: enumerators
                        };
                    }
                    this.isInvalid[url] = false;
                } else {
                    this.isInvalid[url] = true;
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
                const tx = this.db.transaction('docFiles', 'readwrite');
                const store = tx.objectStore('docFiles');
                await store.put(data, url);
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

        selectDoc(url: string) {
            this.selectedDocUrl = url;
            this.selectedDoc = this.docs[this.selectedDocUrl];
            localStorage.setItem('selectedDocUrl', url);

            this.searchMode = false;
            this.querySearch = '';
            this.selectedGroup = '';
            this.selectedItem = '';
            this.foundMethod = {};
            this.foundDelegate = {};
            this.foundEnum = {};
            this.foundMode = false;

            this.loadDoc(url);
        },

        addDocUrl(url: string) {
            try {
                const u = new URL(getUrl(url));
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
                            found.push({ url: url, name: '', link: '#/', icon: '' });
                        }

                        const data = this.docs[url];
                        if (data) {
                            for (const [group, content] of Object.entries(data)) {
                                if (group.includes(value)) {
                                    found.push({ url: url, name: group, link: `#/${group}`, icon: 'file-text' });
                                }
                                for (const name of Object.keys(content.methods)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 'square-m' });
                                    }
                                }
                                for (const name of Object.keys(content.delegates)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 'square-function' });
                                    }
                                }
                                for (const name of Object.keys(content.enumerators)) {
                                    if (name.includes(value)) {
                                        found.push({ url: url, name: name, link: `#/${group}/${name}`, icon: 'square-sigma' });
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
                .filter(segment => /^[a-zA-Z0-9-_]+$/.test(segment));

            switch (this.fragments.length) {
                case 1:
                    this.selectedGroup = this.fragments[0];
                    this.selectedItem = '';
                    break;
                case 2:
                    if (this.fragments[0] === 'search' && this.fragments[1].length > 0) {
                        this.searchMode = true;
                        this.selectedGroup = '';
                        this.selectedItem = '';
                        return;
                    }
                    this.searchMode = false;
                    this.querySearch = '';
                    this.selectedGroup = this.fragments[0];
                    this.selectedItem = this.fragments[1];
                    break;
                default:
                    return;
            }

            this.updateSelection();
        },

        updateSelection() {


            this.foundMethod = {};
            this.foundDelegate = {};
            this.foundEnum = {};
            this.foundMode = false;
        },

        onDataUpdated(url: string, data: Document) {
            this.docs[url] = data;
            this.selectedDoc = data;
            this.updateSelection();
        }
    },
})


