import type { Theme } from '@/lib/registry/themes';
import { themes } from '@/lib/registry/themes';
import { sharedCookieOptions } from '~/composables/useSharedCookie';

interface Config {
  theme?: string;
  radius: number;
}

export function useThemes() {
  const colorMode = useColorMode();
  const isDark = computed(() => colorMode.value === 'dark');

  const defaultTheme = useConfig().value.theme;
  // Shared with plugify.net (see useSharedCookie.ts). 'site-theme' was this site's
  // own cookie before the two were synced; a choice saved there is carried over.
  const legacy = useCookie<Config | null>('site-theme');
  const config = useCookie<Config>('plugify-theme', {
    ...sharedCookieOptions(),
    default: (): Config => ({
      theme: legacy.value?.theme ?? defaultTheme.color,
      radius: legacy.value?.radius ?? defaultTheme.radius,
    }),
  });
  // An empty or broken cookie parses to null; fall back to the defaults
  if (!config.value || typeof config.value !== 'object' || !themes.some(t => t.name === config.value.theme)) {
    config.value = { theme: defaultTheme.color, radius: defaultTheme.radius };
  }

  const theme = computed(() => config.value.theme);
  const radius = computed(() => config.value.radius);

  const themeClass = computed(() => `theme-${theme.value}`);

  function setTheme(themeName: string) {
    config.value.theme = themeName;
  }

  function setRadius(newRadius: number) {
    config.value.radius = newRadius;
  }

  const themePrimary = computed(() => {
    const t = themes.find(t => t.name === theme.value);
    return `hsl(${t?.cssVars[isDark.value ? 'dark' : 'light'].primary})`;
  });

  return {
    themeClass,
    theme,
    setTheme,
    radius,
    setRadius,
    themePrimary,
  };
}
