import type { JSX } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Indicateur de chargement affiché pendant le chargement à la demande d'une page.
 */
export function PageLoading(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground"
    >
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
}
