import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Pied de page du site affichant les mentions éducatives et de respect de la vie privée.
 */
export function SiteFooter(): JSX.Element {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <p>{t('layout.footer.educational')}</p>
        <p>{t('layout.footer.privacy')}</p>
      </div>
    </footer>
  );
}
