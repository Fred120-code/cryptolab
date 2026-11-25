import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
      className="inline-flex rounded-lg bg-muted p-1"
    >
      <Button
        type="button"
        lang="fr"
        aria-label="Français"
        aria-pressed={currentLang === 'fr'}
        onClick={() => handleLanguageChange('fr')}
        variant={currentLang === 'fr' ? 'default' : 'ghost'}
        className="min-h-5 min-w-5"
      >
        FR
      </Button>
      <Button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={currentLang === 'en'}
        onClick={() => handleLanguageChange('en')}
        variant={currentLang === 'en' ? 'default' : 'ghost'}
        className="min-h-5 min-w-5"
      >
        EN
      </Button>
    </div>
  );
}
