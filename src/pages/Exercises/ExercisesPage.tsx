import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Page des exercices pratiques.
 */
export function ExercisesPage(): JSX.Element {
  const { t } = useTranslation();
  useDocumentTitle(t('pages.exercises.title'));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t('pages.exercises.title')}
      </h1>
      <p className="text-muted-foreground">{t('pages.placeholder.body')}</p>
    </div>
  );
}
