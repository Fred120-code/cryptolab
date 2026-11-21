import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sélecteur bilingue de langue (Français / Anglais).
 *
 * Offre deux boutons accessibles permettant de basculer la langue de l'application
 * avec respect des cibles tactiles minimales (44x44 px) et des retours d'accessibilité (ARIA).
 */
export function LanguageSwitcher(): JSX.Element {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language.startsWith('en') ? 'en' : 'fr';

  const handleLanguageChange = (lang: 'fr' | 'en'): void => {
    void i18n.changeLanguage(lang);
  };

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-gray-800"
    >
      <button
        type="button"
        lang="fr"
        aria-label="Français"
        aria-pressed={currentLang === 'fr'}
        onClick={() => handleLanguageChange('fr')}
        className={`min-w-11 min-h-11 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          currentLang === 'fr'
            ? 'bg-accent text-white shadow-sm'
            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={currentLang === 'en'}
        onClick={() => handleLanguageChange('en')}
        className={`min-w-11 min-h-11 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          currentLang === 'en'
            ? 'bg-accent text-white shadow-sm'
            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
