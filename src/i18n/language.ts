/**
 * Langues supportées par l'application CryptoLab.
 */
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;

/**
 * Type représentant les codes des langues supportées.
 */
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Clé de stockage pour la persistance de la langue dans le navigateur.
 */
const STORAGE_KEY = 'cryptolab:language';

/**
 * Détermine si une valeur inconnue correspond à une langue supportée.
 *
 * @param value - La valeur à vérifier.
 * @returns Vrai si la valeur est 'fr' ou 'en'.
 */
export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Détecte la langue préférée de l'utilisateur.
 *
 * Ordre de priorité :
 * 1. Valeur enregistrée dans le localStorage (si valide et supportée).
 * 2. Langue du navigateur (`navigator.language`) si elle commence par 'fr' ou 'en'.
 * 3. Langue de repli par défaut ('fr').
 *
 * Tous les accès au localStorage sont sécurisés dans un bloc try/catch.
 *
 * @returns La langue détectée ('fr' ou 'en').
 */
export function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // localStorage inaccessible (navigation privée stricte, etc.), poursuite de la détection.
  }

  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('fr')) {
      return 'fr';
    }
    if (navLang.startsWith('en')) {
      return 'en';
    }
  }

  return 'fr';
}

/**
 * Persiste la langue choisie dans le localStorage.
 *
 * Échoue silencieusement si le stockage n'est pas accessible.
 *
 * @param lang - La langue à persister.
 */
export function persistLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Échec silencieux.
  }
}
