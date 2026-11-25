import { Suspense, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlgorithmNav } from '@/components/navigation/AlgorithmNav';
import { isAlgorithmId } from '@/config/algorithms';
import { labPath } from '@/config/routes';
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

  if (!valid) {
    return <NotFoundPage />;
  }

  const LabComponent = LABS[algorithm];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{t('playground.notice')}</p>
      </header>

      <AlgorithmNav buildPath={labPath} ariaLabel={t('nav.algorithmTabs')} />

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
