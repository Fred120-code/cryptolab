import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaesarStepData } from '@/algorithms/caesar';
import type { ExecutionStep, OperationMode } from '@/types';
import { CaesarDial } from './CaesarDial';

/**
 * Propriétés attendues par le composant `CaesarVisualizer`.
 */
export interface CaesarVisualizerProps {
  /** Étape d'exécution courante issue de l'algorithme de César */
  step: ExecutionStep<CaesarStepData> | undefined;
  /** Mode d'opération cryptographique actif (chiffrement ou déchiffrement) */
  mode: OperationMode;
  /** Durée allouée à une étape en millisecondes */
  stepDurationMs: number;
}

/**
 * Visualiseur graphique de l'algorithme de César représentant un cadran circulaire d'alphabet.
 *
 * Affiche le cadran circulaire interactif `CaesarDial` ainsi qu'un tableau récapitulatif
 * des informations d'exécution de l'étape courante.
 *
 * @param props Propriétés incluant l'étape, le mode d'opération et la durée de l'étape.
 */
export function CaesarVisualizer({
  step,
  mode,
  stepDurationMs,
}: CaesarVisualizerProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card role="region" aria-labelledby="caesar-visualizer-title" className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle id="caesar-visualizer-title" className="text-base">
          {t('visualizer.caesar.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 px-4">
        {/* Cadran SVG circulaire */}
        <CaesarDial step={step} mode={mode} stepDurationMs={stepDurationMs} />

        {/* Tableau récapitulatif descriptif */}
        <div className="flex w-full flex-col gap-2 border-t border-border pt-3">
          <dl className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.caesar.letter')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.input : '—'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.caesar.position')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.data.inputIndex : '—'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.caesar.key')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.data.shift : '—'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.caesar.result')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? `${step.output} (${step.data.outputIndex})` : '—'}
              </dd>
            </div>
          </dl>

          <p className="min-h-4 text-center text-xs text-muted-foreground">
            {step?.data.wrapped
              ? mode === 'encrypt'
                ? t('visualizer.caesar.wrappedEncrypt')
                : t('visualizer.caesar.wrappedDecrypt')
              : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
