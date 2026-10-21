import { useRouter } from '#app';
import { useDocStore } from '~/lib/docStore';
import { findDefaultManifest } from '~/lib/manifests';

/**
 * Hash navigation that keeps the address bar shareable: while a manifest outside
 * manifests.json is open, ?file= names it, so a link copied from the address bar opens
 * for anyone. A plain router.push('#/...') would drop the query.
 */
export function useDocNavigation() {
  const router = useRouter();
  const store = useDocStore();

  /** The current query with ?file= set for the given (default: open) manifest. */
  function queryFor(url = store.selectedDocUrl) {
    const query = { ...router.currentRoute.value.query };
    if (url && !findDefaultManifest(url)) {
      query.file = url;
    } else {
      delete query.file;
    }
    return query;
  }

  function go(hash: string) {
    return router.push({ query: queryFor(), hash });
  }

  /** Selects an API and opens its first group once the manifest is loaded. */
  async function openApi(url: string) {
    // Selecting clears the open page; show loading instead of the home page until the
    // API's first group is open
    store.openingApi = url;
    try {
      store.addDocUrl(url);
      if (url !== store.selectedDocUrl) store.selectDoc(url);
      const doc = await store.ensureDoc(url);
      const first = Object.entries(doc || {})
        .find(([, content]) => Object.keys(content.methods).length + Object.keys(content.classes).length > 0)?.[0];
      if (store.selectedDocUrl !== url) return; // another API was picked meanwhile
      await go(first ? `#/${first}` : '#/');
    } finally {
      if (store.openingApi === url) store.openingApi = '';
    }
  }

  return { go, queryFor, openApi };
}
