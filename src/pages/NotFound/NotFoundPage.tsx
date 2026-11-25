import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

/**
 * Page d'erreur 404 affichée lorsqu'une route ou un algorithme est introuvable.
 */
export function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  useDocumentTitle(t('pages.notFound.title'));

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t('pages.notFound.title')}
      </h1>
      <p className="text-muted-foreground">{t('pages.notFound.body')}</p>
      <Link to={ROUTES.home} className={cn(buttonVariants({ variant: 'default' }), 'min-h-11')}>
        {t('pages.notFound.home')}
      </Link>
    </div>
  );
}
