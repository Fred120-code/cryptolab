import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALGORITHM_META, DIFFICULTIES, type AlgorithmOperation } from '@/config/algorithms';
import { docsPath, labPath } from '@/config/routes';
import type { AlgorithmId } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Indicateur visuel de difficulté : trois petits points dont le nombre de remplis
 * reflète le niveau (1 = débutant, 2 = intermédiaire, 3 = avancé).
 * L'information repose sur le texte du badge, les points sont décoratifs.
 */
function DifficultyDots({ level }: { level: number }): JSX.Element {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full',
            i < level ? 'bg-primary' : 'bg-muted-foreground/30',
          )}
        />
      ))}
    </>
  );
}

/**
 * Carte de présentation d'un algorithme cryptographique.
 *
 * @param id Identifiant de l'algorithme.
 * @param variant Variante d'affichage : `'compact'` (résumé) ou `'full'` (détails complets).
 * @param headingLevel Niveau de titre HTML pour le nom de l'algorithme (`2` ou `3`, défaut `3`).
 */
export function AlgorithmCard({
  id,
  variant = 'full',
  headingLevel = 3,
}: {
  id: AlgorithmId;
  variant?: 'compact' | 'full';
  headingLevel?: 2 | 3;
}): JSX.Element {
  const { t } = useTranslation();
  const meta = ALGORITHM_META[id];
  const difficultyLevel = DIFFICULTIES.indexOf(meta.difficulty) + 1;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Heading className="text-lg font-semibold">{t(`algorithms.${id}.name`)}</Heading>
        </CardTitle>
        <Badge variant="secondary" className="inline-flex w-fit items-center gap-1">
          <DifficultyDots level={difficultyLevel} />
          {t(`algorithms.difficulty.${meta.difficulty}`)}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t(`algorithms.${id}.description`)}</p>

        {variant === 'full' && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">{t('algorithms.principleLabel')}</p>
              <p className="mt-1 text-sm">{t(`algorithms.${id}.principle`)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">{t('algorithms.operationsLabel')}</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {meta.operations.map((op: AlgorithmOperation) => (
                  <li key={op}>
                    <Badge variant="outline">{t(`algorithms.operations.${op}`)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild className="min-h-11">
            <Link to={labPath(id)}>{t('algorithms.openLab')}</Link>
          </Button>
          {variant === 'full' && (
            <Button asChild variant="outline" className="min-h-11">
              <Link to={docsPath(id)}>{t('algorithms.readDocs')}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
