import type { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAlgorithmId } from '@/config/algorithms';
import { useRecordVisit } from '@/hooks/useActivity';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

/**
 * Page de cryptanalyse d'un algorithme donné.
 */
export function CryptanalysisPage(): JSX.Element {
  const { t } = useTranslation();
  const { algorithm } = useParams();

  const valid = isAlgorithmId(algorithm);
  const algorithmName = valid ? t(`algorithms.${algorithm}.name`) : '';
  const pageTitle = valid
    ? t('pages.cryptanalysis.title', { algorithm: algorithmName })
    : t('pages.notFound.title');
  useDocumentTitle(pageTitle);
  useRecordVisit('cryptanalysis', valid ? algorithm : undefined);

  if (!valid) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
      <p className="text-muted-foreground">{t('pages.placeholder.body')}</p>
    </div>
  );
}
