import { useLayoutEffect, type JSX } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubstitutionStepData } from '@/algorithms/substitution';
import type { ExecutionStep, OperationMode } from '@/types';
import { BAND_SIZE } from './layout';

/**
 * Propriétés attendues par le composant `SubstitutionVisualizer`.
 */
export interface SubstitutionVisualizerProps {
  /** Étape d'exécution courante issue de l'algorithme de substitution */
  step: ExecutionStep<SubstitutionStepData> | undefined;
  /** Alphabet de substitution valide de 26 lettres (précondition : 26 caractères alphabétiques uniques) */
  alphabet: string;
  /** Mode d'opération cryptographique actif (chiffrement ou déchiffrement) */
  mode: OperationMode;
  /** Durée allouée à une étape en millisecondes */
  stepDurationMs: number;
}

/**
 * Visualiseur graphique de l'algorithme de substitution monoalphabétique.
 *
 * Affiche la correspondance entre l'alphabet standard et l'alphabet de substitution
 * sous forme de deux bandes de 13 colonnes. Anime la transition verticale entre la lettre
 * d'entrée et la lettre de sortie à l'aide de Framer Motion, en respectant les préférences
 * d'accessibilité (prefers-reduced-motion) et les jetons de design sémantiques.
 *
 * @param props Propriétés incluant l'étape, l'alphabet, le mode et la durée d'étape.
 */
export function SubstitutionVisualizer({
  step,
  alphabet,
  mode,
  stepDurationMs,
}: SubstitutionVisualizerProps): JSX.Element {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const normalizedAlphabet = alphabet.toUpperCase();

  const progress = useMotionValue(0);
  const outputOpacity = useMotionValue(0);

  useLayoutEffect(() => {
    if (!step) {
      progress.set(0);
      outputOpacity.set(0);
      return;
    }

    if (shouldReduceMotion) {
      progress.set(1);
      outputOpacity.set(1);
      return;
    }

    progress.set(0);
    outputOpacity.set(0);

    const durationSec = Math.min(0.8, Math.max(0.15, (stepDurationMs / 1000) * 0.6));
    let opacityControls: { stop: () => void } | undefined;
    const progressControls = animate(progress, 1, {
      duration: durationSec,
      ease: 'easeInOut',
      onComplete: () => {
        opacityControls = animate(outputOpacity, 1, { duration: 0.2 });
      },
    });

    return () => {
      progressControls.stop();
      opacityControls?.stop();
    };
  }, [step, stepDurationMs, shouldReduceMotion, progress, outputOpacity]);

  const ariaLabel = step
    ? t('visualizer.substitution.ariaLabel', {
        from: step.input,
        to: step.output,
      })
    : t('visualizer.substitution.ariaLabelEmpty');

  return (
    <Card role="region" aria-labelledby="substitution-visualizer-title" className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle id="substitution-visualizer-title" className="text-base">
          {t('visualizer.substitution.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 px-4">
        {/* Légende descriptive des deux rangées alphabétiques */}
        <div className="flex w-full flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-3.5 rounded border border-border bg-card" aria-hidden="true" />
            <span>{t('visualizer.substitution.normalAlphabet')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-3.5 rounded border border-transparent bg-muted"
              aria-hidden="true"
            />
            <span>{t('visualizer.substitution.substitutionAlphabet')}</span>
          </div>
        </div>

        {/* Grille principale des deux bandes de 13 colonnes */}
        <div role="img" aria-label={ariaLabel} className="w-full">
          <div className="flex w-full flex-col gap-3" aria-hidden="true">
            {[0, 1].map((bandIndex) => (
              <div
                key={bandIndex}
                className="grid gap-0.5 sm:gap-1"
                style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
              >
                {Array.from({ length: BAND_SIZE }, (_, colIndex) => {
                  const letterIndex = bandIndex * BAND_SIZE + colIndex;
                  const normalChar = String.fromCharCode(65 + letterIndex);
                  const subChar = normalizedAlphabet[letterIndex] ?? normalChar;
                  const isActive = step !== undefined && step.data.plainIndex === letterIndex;

                  const isNormalInput = isActive && mode === 'encrypt';
                  const isNormalOutput = isActive && mode === 'decrypt';
                  const isSubInput = isActive && mode === 'decrypt';
                  const isSubOutput = isActive && mode === 'encrypt';

                  return (
                    <div key={letterIndex} className="flex flex-col items-center">
                      {/* Case de l'alphabet normal (haut) */}
                      <div
                        className={cn(
                          'relative flex aspect-square w-full select-none items-center justify-center rounded font-mono text-xs sm:text-sm font-medium',
                          isNormalInput
                            ? 'border border-primary bg-primary text-primary-foreground'
                            : 'border border-border bg-card text-foreground',
                        )}
                      >
                        {normalChar}
                        {isNormalOutput && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center rounded bg-card font-mono text-xs sm:text-sm font-medium text-foreground ring-2 ring-highlight"
                            style={{ opacity: outputOpacity }}
                          >
                            {normalChar}
                          </motion.div>
                        )}
                      </div>

                      {/* Connecteur vertical intermédiaire */}
                      <div className="relative flex h-5 w-full items-center justify-center">
                        {isActive && (
                          <motion.div
                            className="mx-auto h-full w-0.5 rounded-full bg-highlight"
                            style={{
                              scaleY: progress,
                              transformOrigin: mode === 'encrypt' ? 'top' : 'bottom',
                            }}
                          />
                        )}
                      </div>

                      {/* Case de l'alphabet de substitution (bas) */}
                      <div
                        className={cn(
                          'relative flex aspect-square w-full select-none items-center justify-center rounded font-mono text-xs sm:text-sm font-medium',
                          isSubInput
                            ? 'border border-primary bg-primary text-primary-foreground'
                            : 'border border-transparent bg-muted text-foreground',
                        )}
                      >
                        {subChar}
                        {isSubOutput && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center rounded bg-card font-mono text-xs sm:text-sm font-medium text-foreground ring-2 ring-highlight"
                            style={{ opacity: outputOpacity }}
                          >
                            {subChar}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau récapitulatif descriptif de l'étape courante */}
        <div className="flex w-full flex-col gap-2 border-t border-border pt-3">
          <dl className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.substitution.letter')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.input : '—'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.substitution.position')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.data.plainIndex : '—'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{t('visualizer.substitution.result')}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {step ? step.output : '—'}
              </dd>
            </div>
          </dl>

          <p className="min-h-4 text-center text-xs text-muted-foreground">
            {step?.data.isFixedPoint ? t('visualizer.substitution.fixedPoint') : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
