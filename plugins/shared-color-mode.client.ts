import { sharedCookieOptions } from '~/composables/useSharedCookie';

// The light/dark choice is kept by @nuxtjs/color-mode in localStorage, which is
// separate for plugify.net and api.plugify.net. Mirror it into a cookie on the
// parent domain so the choice made on one site is picked up by the other.
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  const shared = useCookie<string | null>('plugify-color-mode', sharedCookieOptions());

  // Once the app is ready, not earlier: on a prerendered page color-mode restores
  // the preference from localStorage in its app:mounted hook, and a change made
  // before or during that hook is undone or does not reach the <html> class.
  onNuxtReady(() => {
    const apply = (value: string | null | undefined) => {
      if (value && ['light', 'dark', 'system'].includes(value) && value !== colorMode.preference)
        colorMode.preference = value;
    };
    apply(shared.value);

    // The cookie ref follows changes made in other tabs, so an open page
    // switches together with the one where the choice was made
    watch(shared, apply);
    watch(() => colorMode.preference, (value) => {
      if (shared.value !== value)
        shared.value = value;
    });
  });
});
