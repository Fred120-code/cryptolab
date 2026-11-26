import { Suspense, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlgorithmPageHeader } from '@/components/layout/AlgorithmPageHeader';
import { isAlgorithmId } from '@/config/algorithms';
import { labPath } from '@/config/routes';
import { useRecordVisit } from '@/hooks/useActivity';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { LABS } from './labs';

/**
 * Page de laboratoire interactif pour l'expérimentation d'un algorithme cryptographique.
 */
export function LabPage(): JSX.Element {
  const { t } = useTranslation();
  const { algorithm } = useParams();

  const valid = isAlgorithmId(algorithm);
  const algorithmName = valid ? t(`algorithms.${algorithm}.name`) : '';
  const pageTitle = valid
    ? t('pages.lab.title', { algorithm: algorithmName })
    : t('pages.notFound.title');
  useDocumentTitle(pageTitle);
  useRecordVisit('lab', valid ? algorithm : undefined);

  if (!valid) {
    return <NotFoundPage />;
  }

  const LabComponent = LABS[algorithm];

  return (
    <div>
      <AlgorithmPageHeader
        title={pageTitle}
        buildPath={labPath}
        navLabel={t('nav.algorithmTabs')}
      />

      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('common.loading', 'Chargement…')}
          </div>
        }
      >
        <LabComponent />
      </Suspense>
    </div>
  );
}
