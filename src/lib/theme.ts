/**
 * Clé de stockage dans localStorage pour la préférence de thème.
 */
export const THEME_STORAGE_KEY = 'cryptolab:theme';

/**
 * Thème visuel de l'application.
 */
export type Theme = 'light' | 'dark';

type Listener = () => void;

const listeners = new Set<Listener>();
let currentTheme: Theme | null = null;

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Stockage indisponible : repli sur la préférence système.
  }
  return null;
}

function detectSystemTheme(): Theme {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function resolveTheme(): Theme {
  return readStoredTheme() ?? detectSystemTheme();
}

/**
 * Applique la classe CSS correspondant au thème sur la racine HTML.
 *
 * @param theme Thème à appliquer (`'light'` ou `'dark'`).
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key === THEME_STORAGE_KEY || event.key === null) {
    currentTheme = resolveTheme();
    applyTheme(currentTheme);
    notifyListeners();
  }
}

/**
 * Souscrit aux changements du thème actif.
 *
 * @param callback Fonction appelée à chaque modification.
 * @returns Fonction de désabonnement.
 */
export function subscribeTheme(callback: Listener): () => void {
  listeners.add(callback);
  if (listeners.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/**
 * Retourne le thème courant pour `useSyncExternalStore`.
 *
 * @returns `'light'` ou `'dark'`.
 */
export function getThemeSnapshot(): Theme {
  if (currentTheme === null) {
    currentTheme = resolveTheme();
    applyTheme(currentTheme);
  }
  return currentTheme;
}

/**
 * Définit et persiste le thème choisi par l'utilisateur.
 *
 * @param theme Nouveau thème (`'light'` ou `'dark'`).
 */
export function setTheme(theme: Theme): void {
  currentTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Stockage indisponible : échec silencieux.
  }
  applyTheme(theme);
  notifyListeners();
}

/**
 * Bascule entre le thème clair et le thème sombre.
 */
export function toggleTheme(): void {
  const next: Theme = getThemeSnapshot() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}
