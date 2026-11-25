import { useSyncExternalStore } from 'react';
import { getThemeSnapshot, setTheme, subscribeTheme, toggleTheme, type Theme } from '@/lib/theme';

/**
 * Hook exposant le thème courant (`'light'` ou `'dark'`) et les actions pour le modifier.
 *
 * @returns `{ theme, setTheme, toggleTheme }`.
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'light' as const);
  return { theme, setTheme, toggleTheme };
}
