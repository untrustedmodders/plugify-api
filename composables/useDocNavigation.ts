import { useRouter } from '#app';
import { useDocStore } from '~/lib/docStore';
import { findDefaultManifest, isLocalDoc, manifestPath } from '~/lib/manifests';

/**
 * Hash navigation that keeps the address bar shareable: a listed manifest is opened at its
 * own address (/s2sdk#/Group/Item), any other one on / with ?file= naming it, so a link
 * copied from the address bar opens for anyone. A plain router.push('#/...') would keep
 * the path and the query of whatever manifest was open before; and Nuxt's router (this
 * site has no pages) turns a hash-only push into /#..., dropping the path altogether.
 */
export function useDocNavigation() {
  const router = useRouter();
  const store = useDocStore();

  /**
   * The current query with ?file= set for the given (default: open) manifest. A manifest
   * from disk opens for no one else, so it is not named: a reload picks it from the saved state.
   */
  function queryFor(url = store.selectedDocUrl) {
    const query = { ...router.currentRoute.value.query };
    if (url && !findDefaultManifest(url) && !isLocalDoc(url)) {
      query.file = url;
    } else {
      delete query.file;
    }
    return query;
  }

  /** The path for a hash: the home page (#/) is at /, a manifest's pages at its address. */
  function pathFor(hash: string, url = store.selectedDocUrl) {
    return /^#?\/?$/.test(hash) ? '/' : manifestPath(url);
  }

  function go(hash: string, replace = false) {
    const to = { path: pathFor(hash), query: queryFor(), hash };
    return replace ? router.replace(to) : router.push(to);
  }

  /**
   * Selects an API and opens its first group once the manifest is loaded. replace: do not
   * leave the current address in the history (it would bring the visitor right back here).
   */
  async function openApi(url: string, replace = false) {
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
      await go(first ? `#/${first}` : '#/', replace);
    } finally {
      if (store.openingApi === url) store.openingApi = '';
    }
  }

  return { go, queryFor, pathFor, openApi };
}
