import type { JSX } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

/**
 * Bouton de bascule entre le thème clair et le thème sombre.
 *
 * Respecte la taille tactile minimale (44x44 px) et expose un libellé accessible traduit.
 */
export function ThemeSwitcher(): JSX.Element {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? t('nav.switchToLight') : t('nav.switchToDark');

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}
