import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { AlgorithmCard } from '@/components/algorithms/AlgorithmCard';
import { ALGORITHM_IDS } from '@/config/algorithms';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Page récapitulative des algorithmes cryptographiques.
 */
export function AlgorithmsPage(): JSX.Element {
  const { t } = useTranslation();
  useDocumentTitle(t('pages.algorithms.title'));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        {t('pages.algorithms.title')}
      </h1>
      <p className="max-w-prose text-muted-foreground">{t('pages.algorithms.intro')}</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {ALGORITHM_IDS.map((id) => (
          <li key={id}>
            <AlgorithmCard id={id} variant="full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
