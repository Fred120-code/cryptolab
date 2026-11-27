import { Suspense, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlgorithmPageHeader } from '@/components/layout/AlgorithmPageHeader';
import { PageLoading } from '@/components/layout/PageLoading';
import { isAlgorithmId } from '@/config/algorithms';
import { cryptanalysisPath } from '@/config/routes';
import { useRecordVisit } from '@/hooks/useActivity';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { CRYPTANALYSIS_TOOLS } from './tools';

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

  const ToolComponent = CRYPTANALYSIS_TOOLS[algorithm];

  return (
    <div>
      <AlgorithmPageHeader
        title={pageTitle}
        buildPath={cryptanalysisPath}
        navLabel={t('nav.algorithmTabs')}
      />

      {ToolComponent ? (
        <Suspense fallback={<PageLoading />}>
          <ToolComponent />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">{t('pages.placeholder.body')}</p>
      )}
    </div>
  );
}
