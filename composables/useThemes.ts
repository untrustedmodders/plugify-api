import type { Theme } from '@/lib/registry/themes';
import { themes } from '@/lib/registry/themes';

interface Config {
  theme?: string;
  radius: number;
}

export function useThemes() {
  const { value: color } = useColorMode();
  const isDark = color === 'dark';

  const defaultTheme = useConfig().value.theme;
  const config = useCookie<Config>('theme', {
    default: (): Config => ({
      theme: defaultTheme.color,
      radius: defaultTheme.radius,
    }),
  });

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
    return `hsl(${t?.cssVars[isDark ? 'dark' : 'light'].primary})`;
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
