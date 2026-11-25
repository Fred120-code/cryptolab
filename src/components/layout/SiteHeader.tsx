import type { JSX } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { MobileNav } from '@/components/navigation/MobileNav';
import { NAV_ITEMS } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

/**
 * En-tête de site principal avec logo, navigation de bureau, sélecteur de langue et menu mobile.
 */
export function SiteHeader(): JSX.Element {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo et lien vers l'accueil */}
        <Link
          to={ROUTES.home}
          aria-label={t('nav.homeLink')}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-foreground transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <KeyRound className="size-5" aria-hidden="true" />
          <span>CryptoLab</span>
        </Link>

        {/* Navigation principale pour écrans larges */}
        <nav aria-label={t('nav.main')} className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ path, labelKey, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-muted text-foreground underline underline-offset-8'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Outils secondaires : sélecteur de thème, sélecteur de langue et menu mobile */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
