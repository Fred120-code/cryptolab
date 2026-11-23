import { useLayoutEffect, type JSX } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PermutationStepData } from '@/algorithms/permutation';
import type { ExecutionStep, OperationMode } from '@/types';
import {
  BOTTOM_Y,
  cellCenterX,
  cellSize,
  LABEL_BOTTOM_Y,
  LABEL_TOP_Y,
  lerp,
  NUMBERS_BOTTOM_Y,
  NUMBERS_TOP_Y,
  tokenProgress,
  TOP_Y,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './layout';

/**
 * Propriétés attendues par le composant `PermutationVisualizer`.
 */
export interface PermutationVisualizerProps {
  /** Étape d'exécution courante issue de l'algorithme de permutation (représente un bloc entier) */
  step: ExecutionStep<PermutationStepData> | undefined;
  /** Mode d'opération cryptographique actif (chiffrement ou déchiffrement) */
  mode: OperationMode;
  /** Durée allouée à l'étape en millisecondes */
  stepDurationMs: number;
}

/**
 * Propriétés du sous-composant `MoveToken` gérant l'animation individuelle d'un caractère.
 */
interface MoveTokenProps {
  progress: MotionValue<number>;
  fromX: number;
  toX: number;
  size: number;
  char: string;
  isPadding: boolean;
  order: number;
  n: number;
}

/**
 * Sous-composant représentant un jeton de caractère en cours de déplacement.
 */
function MoveToken({
  progress,
  fromX,
  toX,
  size,
  char,
  isPadding,
  order,
  n,
}: MoveTokenProps): JSX.Element {
  const x = useTransform(progress, (p) => lerp(fromX, toX, tokenProgress(p, order, n)));
  const y = useTransform(progress, (p) => lerp(TOP_Y, BOTTOM_Y, tokenProgress(p, order, n)));
  const innerSize = size - 2;
  const half = innerSize / 2;
  const fontSize = Math.round(size * 0.5);

  return (
    <motion.g style={{ x, y }}>
      <rect
        width={innerSize}
        height={innerSize}
        x={-half}
        y={-half}
        rx={4}
        className={isPadding ? 'fill-muted stroke-muted-foreground' : 'fill-primary'}
        strokeWidth={isPadding ? 1.5 : undefined}
        strokeDasharray={isPadding ? '3 2' : undefined}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className={cn(
          'font-mono font-medium select-none',
          isPadding ? 'fill-muted-foreground' : 'fill-primary-foreground',
        )}
        style={{ fontSize }}
      >
        {char}
      </text>
    </motion.g>
  );
}

/**
 * Visualiseur graphique pour l'algorithme de chiffrement par permutation de blocs.
 *
 * Représente les positions d'entrée et de sortie d'un bloc de texte, les trajectoires
 * de déplacement des caractères, ainsi que les jetons mobiles animés avec échelonnement temporel.
 *
 * @param props Propriétés incluant l'étape courante, le mode d'opération et la durée de l'étape.
 */
export function PermutationVisualizer({
  step,
  mode,
  stepDurationMs,
}: PermutationVisualizerProps): JSX.Element {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const progress = useMotionValue(0);

  useLayoutEffect(() => {
    if (!step) {
      progress.set(0);
      return;
    }

    if (shouldReduceMotion) {
      progress.set(1);
      return;
    }

    progress.set(0);
    const durationSec = Math.min(1.6, Math.max(0.3, (stepDurationMs / 1000) * 0.8));
    const controls = animate(progress, 1, {
      duration: durationSec,
      ease: 'linear',
    });

    return () => {
      controls.stop();
    };
  }, [step, stepDurationMs, shouldReduceMotion, progress]);

  const data = step?.data;
  const n = data?.blockSize ?? 0;
  const size = n > 0 ? cellSize(n) : 0;
  const inputChars = step ? Array.from(step.input) : [];

  const ariaLabel =
    step && data
      ? t('visualizer.permutation.ariaLabel', {
          from: step.input,
          to: step.output,
          permutation: data.permutation.join(', '),
        })
      : '';

  return (
    <Card role="region" aria-labelledby="permutation-visualizer-title">
      <CardHeader>
        <CardTitle id="permutation-visualizer-title">{t('visualizer.permutation.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {!step || !data ? (
          <p className="text-sm text-muted-foreground">{t('visualizer.permutation.empty')}</p>
        ) : (
          <>
            {/* Schéma vectoriel des déplacements du bloc */}
            <svg
              role="img"
              aria-label={ariaLabel}
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              className="aspect-[4/3] w-full max-w-lg select-none"
            >
              {/* Libellé du bloc d'entrée */}
              <text
                x={200}
                y={LABEL_TOP_Y}
                textAnchor="middle"
                className="fill-muted-foreground text-xs select-none"
              >
                {t('visualizer.permutation.inputBlock')}
              </text>

              {/* Libellé du bloc de sortie */}
              <text
                x={200}
                y={LABEL_BOTTOM_Y}
                textAnchor="middle"
                className="fill-muted-foreground text-xs select-none"
              >
                {t('visualizer.permutation.outputBlock')}
              </text>

              {/* Numéros de position d'entrée (1 à n) */}
              {Array.from({ length: n }, (_, i) => (
                <text
                  key={`in-num-${i}`}
                  x={cellCenterX(i, n)}
                  y={NUMBERS_TOP_Y}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs select-none"
                >
                  {i + 1}
                </text>
              ))}

              {/* Rangée de n cases d'entrée avec lettre originale en arrière-plan */}
              {Array.from({ length: n }, (_, i) => {
                const cx = cellCenterX(i, n);
                return (
                  <g key={`in-cell-${i}`}>
                    <rect
                      x={cx - size / 2}
                      y={TOP_Y - size / 2}
                      width={size}
                      height={size}
                      rx={4}
                      className="fill-card stroke-border"
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={TOP_Y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-muted-foreground font-mono text-sm font-medium select-none"
                    >
                      {inputChars[i] ?? ''}
                    </text>
                  </g>
                );
              })}

              {/* Lignes de liaison faibles et jetons animés remontés à chaque nouvelle étape */}
              <g key={`${step.index}:${step.input}:${data.permutation.join(',')}:${mode}`}>
                {data.moves.map((move, idx) => {
                  const fromX = cellCenterX(move.from, n);
                  const toX = cellCenterX(move.to, n);
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={fromX}
                      y1={TOP_Y + size / 2}
                      x2={toX}
                      y2={BOTTOM_Y - size / 2}
                      className="stroke-border"
                      strokeWidth={1}
                    />
                  );
                })}

                {data.moves.map((move, idx) => {
                  const fromX = cellCenterX(move.from, n);
                  const toX = cellCenterX(move.to, n);
                  return (
                    <MoveToken
                      key={`token-${idx}`}
                      progress={progress}
                      fromX={fromX}
                      toX={toX}
                      size={size}
                      char={move.char}
                      isPadding={move.isPadding}
                      order={move.to}
                      n={n}
                    />
                  );
                })}
              </g>

              {/* Rangée de n cases de sortie */}
              {Array.from({ length: n }, (_, k) => {
                const cx = cellCenterX(k, n);
                const isPaddingCell = data.moves.some((m) => m.to === k && m.isPadding);
                return (
                  <rect
                    key={`out-cell-${k}`}
                    x={cx - size / 2}
                    y={BOTTOM_Y - size / 2}
                    width={size}
                    height={size}
                    rx={4}
                    className={cn(
                      'fill-card',
                      isPaddingCell ? 'stroke-muted-foreground' : 'stroke-border',
                    )}
                    strokeWidth={1}
                    strokeDasharray={isPaddingCell ? '3 2' : undefined}
                  />
                );
              })}

              {/* Numéros de position de sortie (1 à n) */}
              {Array.from({ length: n }, (_, k) => (
                <text
                  key={`out-num-${k}`}
                  x={cellCenterX(k, n)}
                  y={NUMBERS_BOTTOM_Y}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs select-none"
                >
                  {k + 1}
                </text>
              ))}
            </svg>

            {/* Informations textuelles et récapitulatif descriptif sous le SVG */}
            <div className="flex w-full flex-col items-center gap-4 border-t border-border pt-4">
              {data.hasPadding && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="size-3.5 rounded border border-muted-foreground bg-muted border-dashed"
                    style={{ strokeDasharray: '3 2' }}
                    aria-hidden="true"
                  />
                  <span>
                    {mode === 'encrypt'
                      ? t('visualizer.permutation.paddingLegendEncrypt')
                      : t('visualizer.permutation.paddingLegendDecrypt')}
                  </span>
                </div>
              )}

              <p className="font-mono text-sm text-foreground text-center">
                {mode === 'encrypt'
                  ? t('visualizer.permutation.appliedEncrypt', {
                      permutation: data.permutation.join(', '),
                    })
                  : t('visualizer.permutation.appliedDecrypt', {
                      permutation: data.permutation.join(', '),
                    })}
              </p>

              <dl className="grid w-full grid-cols-3 gap-4 text-center">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">
                    {t('visualizer.permutation.block')}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">
                    {data.blockIndex + 1}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">
                    {t('visualizer.permutation.blockSize')}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">
                    {data.blockSize}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">
                    {t('visualizer.permutation.padding')}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">
                    {data.paddingCount}
                  </dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
