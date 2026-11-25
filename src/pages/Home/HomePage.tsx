import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlgorithmCard } from '@/components/algorithms/AlgorithmCard';
import { CipherStrip } from '@/components/home/CipherStrip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ALGORITHM_IDS } from '@/config/algorithms';
import { cryptanalysisPath, docsPath, labPath, ROUTES } from '@/config/routes';
import { useActivity } from '@/hooks/useActivity';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { latestUnique, type ActivityEntry } from '@/lib/activity';
import { formatRelativeTime } from '@/utils/time';

function activityPath(entry: ActivityEntry): string {
  switch (entry.kind) {
    case 'lab':
      return labPath(entry.algorithm);
    case 'docs':
      return docsPath(entry.algorithm);
    case 'cryptanalysis':
      return cryptanalysisPath(entry.algorithm);
    case 'exercise':
      return ROUTES.exercises;
  }
}

/**
 * Page d'accueil de CryptoLab.
 */
export function HomePage(): JSX.Element {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('pages.home.title'), true);

  const { entries, clear } = useActivity();
  const recent = latestUnique(entries, 5);
  const [now] = useState(() => Date.now());
  const [cleared, setCleared] = useState(false);

  const handleClear = (): void => {
    clear();
    setCleared(true);
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-prose text-muted-foreground">{t('home.hero.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="min-h-11">
              <Link to={labPath('caesar')}>{t('home.hero.ctaLab')}</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to={ROUTES.algorithms}>{t('home.hero.ctaAlgorithms')}</Link>
            </Button>
          </div>
        </div>

        <CipherStrip />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t('home.algorithms.title')}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {ALGORITHM_IDS.map((id) => (
            <li key={id}>
              <AlgorithmCard id={id} variant="compact" />
            </li>
          ))}
        </ul>
        <div>
          <Link
            to={ROUTES.algorithms}
            className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t('home.algorithms.all')}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t('home.activity.title')}</h2>

        {recent.length === 0 ? (
          <p className="max-w-prose text-sm text-muted-foreground">{t('home.activity.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {recent.map((entry) => (
              <li key={`${entry.kind}:${entry.algorithm}`}>
                <Link
                  to={activityPath(entry)}
                  className="flex min-h-11 items-center justify-between gap-4 rounded-md px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>
                    {t(`activity.kind.${entry.kind}`)} · {t(`algorithms.${entry.algorithm}.name`)}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatRelativeTime(entry.at, now, i18n.language)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="max-w-prose text-xs text-muted-foreground">{t('home.activity.privacy')}</p>

        {recent.length > 0 && (
          <div>
            <Button type="button" variant="outline" className="min-h-11" onClick={handleClear}>
              {t('home.activity.clear')}
            </Button>
          </div>
        )}

        <p role="status" className="sr-only">
          {cleared ? t('home.activity.cleared') : ''}
        </p>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-semibold">{t('home.exercises.title')}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="max-w-prose text-muted-foreground">{t('home.exercises.body')}</p>
            <div>
              <Button asChild className="min-h-11">
                <Link to={ROUTES.exercises}>{t('home.exercises.cta')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
