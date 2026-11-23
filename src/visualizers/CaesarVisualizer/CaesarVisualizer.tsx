import { useLayoutEffect, useRef, type JSX } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaesarStepData } from '@/algorithms/caesar';
import type { ExecutionStep, OperationMode } from '@/types';
import { ALPHABET_SIZE_DEG_STEP, angleForIndex, arcPath, polarToCartesian } from './geometry';

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

/** Informations statiques précalculées pour les 26 lettres de l'alphabet */
const ALPHABET_NODES = Array.from({ length: 26 }, (_, i) => ({
  index: i,
  char: String.fromCharCode(65 + i),
  center: polarToCartesian(200, 200, 150, angleForIndex(i)),
}));

/**
 * Visualiseur graphique de l'algorithme de César représentant un cadran circulaire d'alphabet.
 *
 * Anime la transition d'une lettre d'entrée vers sa lettre de sortie le long d'un arc circulaire
 * à l'aide de Framer Motion. Respecte les préférences d'animation réduite (`prefers-reduced-motion`)
 * et applique strictement les jetons de design sémantiques.
 *
 * @param props Propriétés incluant l'étape, le mode d'opération et la durée de l'étape.
 */
export function CaesarVisualizer({
  step,
  mode,
  stepDurationMs,
}: CaesarVisualizerProps): JSX.Element {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const angle = useMotionValue(-90);
  const outputOpacity = useMotionValue(1);
  const startAngleRef = useRef(-90);

  const pointX = useTransform(angle, (a) => polarToCartesian(200, 200, 122, a).x);
  const pointY = useTransform(angle, (a) => polarToCartesian(200, 200, 122, a).y);
  const arcD = useTransform(angle, (currentAngle) =>
    arcPath(200, 200, 122, startAngleRef.current, currentAngle),
  );

  useLayoutEffect(() => {
    if (!step) {
      outputOpacity.set(0);
      return;
    }

    const startA = angleForIndex(step.data.inputIndex);
    startAngleRef.current = startA;
    const direction = mode === 'encrypt' ? 1 : -1;
    const targetA = startA + direction * step.data.shift * ALPHABET_SIZE_DEG_STEP;

    if (shouldReduceMotion) {
      angle.set(targetA);
      outputOpacity.set(1);
      return;
    }

    angle.set(startA);
    outputOpacity.set(0);
    const durationSec = Math.min(1, Math.max(0.15, (stepDurationMs / 1000) * 0.7));

    let opacityControls: { stop: () => void } | undefined;
    const angleControls = animate(angle, targetA, {
      duration: durationSec,
      ease: 'easeInOut',
      onComplete: () => {
        opacityControls = animate(outputOpacity, 1, { duration: 0.2 });
      },
    });

    return () => {
      angleControls.stop();
      opacityControls?.stop();
    };
  }, [step, mode, stepDurationMs, shouldReduceMotion, angle, outputOpacity]);

  const ariaLabel = step
    ? t('visualizer.caesar.ariaLabel', {
        from: step.input,
        to: step.output,
        shift: step.data.shift,
      })
    : t('visualizer.caesar.ariaLabelEmpty');

  return (
    <Card role="region" aria-labelledby="caesar-visualizer-title">
      <CardHeader>
        <CardTitle id="caesar-visualizer-title">{t('visualizer.caesar.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* Cadran SVG circulaire */}
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox="0 0 400 400"
          className="aspect-square w-full max-w-md select-none"
        >
          {/* Cercle principal des lettres (R=150) */}
          <circle cx="200" cy="200" r="150" fill="none" className="stroke-border" strokeWidth="1" />

          {/* Piste intérieure de guidage de l'arc (R=122) */}
          <circle
            cx="200"
            cy="200"
            r="122"
            fill="none"
            className="stroke-border/40"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Arc de rotation animé et curseur mobile */}
          {step !== undefined && (
            <>
              <motion.path
                d={arcD}
                fill="none"
                className="stroke-primary"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <motion.circle
                cx={pointX}
                cy={pointY}
                r={7}
                className="fill-primary stroke-card"
                strokeWidth={2}
              />
            </>
          )}

          {/* 26 nœuds alphabétiques */}
          {ALPHABET_NODES.map(({ index, char, center }) => {
            const isInput = step !== undefined && step.data.inputIndex === index;
            const isOutput = step !== undefined && step.data.outputIndex === index && !isInput;

            return (
              <g key={char}>
                {/* Cercle du nœud */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={14}
                  className={isInput ? 'fill-primary stroke-primary' : 'fill-card stroke-border'}
                  strokeWidth={1}
                />

                {/* Contour accentué de la sortie avec apparition en fondu */}
                {isOutput && (
                  <motion.circle
                    cx={center.x}
                    cy={center.y}
                    r={14}
                    fill="none"
                    className="stroke-primary"
                    strokeWidth={3}
                    style={{ opacity: outputOpacity }}
                  />
                )}

                {/* Lettre au centre */}
                <text
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    'pointer-events-none select-none text-sm font-medium',
                    isInput ? 'fill-primary-foreground' : 'fill-foreground',
                  )}
                >
                  {char}
                </text>
              </g>
            );
          })}

          {/* Indicateur central (Entrée → Sortie et décalage signé) */}
          {step && (
            <g className="pointer-events-none select-none">
              <text
                x={200}
                y={192}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-2xl font-bold"
              >
                {step.input} → {step.output}
              </text>
              <text
                x={200}
                y={218}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-sm font-medium"
              >
                {mode === 'encrypt' ? `+${step.data.shift}` : `\u2212${step.data.shift}`}
              </text>
            </g>
          )}
        </svg>

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
