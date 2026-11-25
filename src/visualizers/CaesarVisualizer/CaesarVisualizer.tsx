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
    <Card role="region" aria-labelledby="caesar-visualizer-title">
      <CardHeader>
        <CardTitle id="caesar-visualizer-title">{t('visualizer.caesar.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* Cadran SVG circulaire */}
        <CaesarDial step={step} mode={mode} stepDurationMs={stepDurationMs} />

        {/* Tableau récapitulatif descriptif */}
        <div className="flex w-full flex-col gap-3 border-t border-border pt-4">
          <dl className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t('visualizer.caesar.letter')}</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">
                {step ? step.input : '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t('visualizer.caesar.position')}</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">
                {step ? step.data.inputIndex : '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t('visualizer.caesar.key')}</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">
                {step ? step.data.shift : '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t('visualizer.caesar.result')}</dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">
                {step ? `${step.output} (${step.data.outputIndex})` : '—'}
              </dd>
            </div>
          </dl>

          {step?.data.wrapped && (
            <p className="text-center text-xs text-muted-foreground">
              {mode === 'encrypt'
                ? t('visualizer.caesar.wrappedEncrypt')
                : t('visualizer.caesar.wrappedDecrypt')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
