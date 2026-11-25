import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslatableText } from '@/hooks/useTranslatableText';
import type { ExecutionStep } from '@/types';

/**
 * Propriétés attendues par le composant `ExplanationPanel`.
 */
export interface ExplanationPanelProps {
  /** Étape d'exécution courante à expliciter, ou undefined en l'absence d'étape */
  step: ExecutionStep<unknown> | undefined;
  /** Indique si la lecture automatique est active */
  isPlaying: boolean;
}

/**
 * Panneau affichant l'explication pédagogique et le détail mathématique de l'étape active.
 *
 * Conçu comme une région dynamique accessible (aria-live "polite" au repos, "off" en lecture).
 *
 * @param props Propriétés du composant incluant l'étape et l'état de lecture.
 */
export function ExplanationPanel({ step, isPlaying }: ExplanationPanelProps): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();

  return (
    <Card role="region" aria-labelledby="explanation-panel-title" className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle id="explanation-panel-title" className="text-base">
          {t('visualizer.explanation.title')}
        </CardTitle>
      </CardHeader>
      <CardContent
        aria-atomic="true"
        aria-live={isPlaying ? 'off' : 'polite'}
        className="flex flex-col gap-3 px-4"
      >
        {step ? (
          <>
            <p className="min-h-[5rem] max-w-prose text-sm leading-relaxed text-foreground">
              {tt(step.explanation)}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">
                  {t('visualizer.explanation.input')}{' '}
                </span>
                {step.input}
              </span>
              <span aria-hidden="true">•</span>
              <span>
                <span className="font-medium text-foreground">
                  {t('visualizer.explanation.calculation')}{' '}
                </span>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono tabular-nums text-foreground">
                  {step.calculation}
                </code>
              </span>
              <span aria-hidden="true">•</span>
              <span>
                <span className="font-medium text-foreground">
                  {t('visualizer.explanation.output')}{' '}
                </span>
                {step.output}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t('visualizer.explanation.empty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
