import { Suspense, useEffect, useRef, type JSX } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLoading } from './PageLoading';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Coquille principale de l'application (App Shell).
 *
 * Intègre le lien d'évitement clavier, l'en-tête du site, la zone de contenu principale
 * avec réinitialisation du défilement et gestion du focus sur navigation, et le pied de page.
 */
export function AppLayout(): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Lien d'évitement accessible */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t('nav.skipToContent')}
      </a>

      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        ref={mainRef}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none sm:px-6"
      >
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
