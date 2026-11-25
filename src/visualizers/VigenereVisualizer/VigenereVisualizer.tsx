import { useEffect, useRef, type JSX } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { VigenereStepData } from '@/algorithms/vigenere';
import type { ExecutionStep, OperationMode } from '@/types';
import { CaesarDial } from '@/visualizers/CaesarVisualizer';
import { toDialStep } from './adapter';
import { formatFormula } from './formula';

/**
 * Propriétés attendues par le composant `VigenereVisualizer`.
 */
export interface VigenereVisualizerProps {
  /** Liste ordonnée de toutes les étapes d'exécution */
  steps: readonly ExecutionStep<VigenereStepData>[];
  /** Index de l'étape actuellement sélectionnée */
  currentIndex: number;
  /** Rappel déclenché lorsqu'une colonne d'étape est sélectionnée manuellement */
  onSelect: (index: number) => void;
  /** Mode d'opération cryptographique actif (chiffrement ou déchiffrement) */
  mode: OperationMode;
  /** Durée allouée à une étape en millisecondes */
  stepDurationMs: number;
}

/**
 * Visualiseur graphique pour l'algorithme du chiffre de Vigenère.
 *
 * Combine un ruban horizontal défilant alignant texte en clair, flux de clé et sortie progressive,
 * l'affichage textuel de la formule mathématique modulaire, et la projection de l'étape courante
 * sur le cadran circulaire `CaesarDial`.
 *
 * @param props Propriétés du visualiseur.
 */
export function VigenereVisualizer({
  steps,
  currentIndex,
  onSelect,
  mode,
  stepDurationMs,
}: VigenereVisualizerProps): JSX.Element {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const el = columnRefs.current[currentIndex];
    if (container && el && typeof container.scrollTo === 'function') {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const left =
        container.scrollLeft +
        (elRect.left - containerRect.left) -
        container.clientWidth / 2 +
        elRect.width / 2;
      container.scrollTo({
        left: Math.max(0, left),
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  }, [currentIndex, steps.length, shouldReduceMotion]);

  const step = steps[currentIndex];

  if (steps.length === 0 || !step) {
    return (
      <Card role="region" aria-labelledby="vigenere-visualizer-title" className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle id="vigenere-visualizer-title" className="text-base">
            {t('visualizer.vigenere.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground">{t('visualizer.vigenere.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  const { line1, line2 } = formatFormula(step, mode);

  return (
    <Card role="region" aria-labelledby="vigenere-visualizer-title" className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle id="vigenere-visualizer-title" className="text-base">
          {t('visualizer.vigenere.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        {/* Ruban horizontal d'alignement avec défilement */}
        <div
          role="group"
          aria-label={t('visualizer.vigenere.stripLabel')}
          ref={containerRef}
          className="overflow-x-auto py-2"
        >
          <div className="flex w-max min-w-full pr-2">
            {/* Colonne fixe d'en-têtes de lignes */}
            <div
              aria-hidden="true"
              className="sticky left-0 z-10 flex flex-col bg-card pr-2 text-xs font-medium text-muted-foreground select-none"
            >
              <div className="flex h-9 items-center justify-end">
                {t('visualizer.vigenere.rowInput')}
              </div>
              <div className="flex h-9 items-center justify-end">
                {t('visualizer.vigenere.rowKey')}
              </div>
              <div className="flex h-9 items-center justify-end">
                {t('visualizer.vigenere.rowOutput')}
              </div>
            </div>

            {/* Colonnes interactives par étape */}
            <div className="flex">
              {steps.map((s, i) => {
                const isCurrent = i === currentIndex;
                const isPastOrCurrent = i <= currentIndex;

                return (
                  <button
                    key={`${s.index}-${s.data.position}`}
                    ref={(el) => {
                      columnRefs.current[i] = el;
                    }}
                    type="button"
                    aria-current={isCurrent ? 'step' : undefined}
                    onClick={() => onSelect(i)}
                    aria-label={t('visualizer.vigenere.columnLabel', {
                      number: i + 1,
                      input: s.input,
                      key: s.data.keyLetter,
                      output: s.output,
                    })}
                    className={cn(
                      'relative flex min-w-11 flex-col items-center rounded-md p-0 transition-colors',
                      'focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="flex h-9 w-full items-center justify-center font-mono text-base font-semibold">
                      {s.input}
                    </span>
                    <span
                      className={cn(
                        'flex h-9 w-full items-center justify-center font-mono text-base font-medium',
                        isCurrent ? 'text-primary-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {s.data.keyLetter}
                    </span>
                    <span className="flex h-9 w-full items-center justify-center font-mono text-base font-semibold">
                      {isPastOrCurrent ? (
                        s.output
                      ) : (
                        <span className="text-muted-foreground">·</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid items-center gap-4 sm:grid-cols-2">
          {/* Détail de la formule arithmétique */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-mono text-lg font-medium tabular-nums text-foreground">{line1}</p>
            <p className="font-mono text-sm tabular-nums text-muted-foreground">{line2}</p>
            <p className="mt-1 min-h-4 text-xs text-muted-foreground">
              {step.data.wrapped
                ? mode === 'encrypt'
                  ? t('visualizer.vigenere.wrappedEncrypt')
                  : t('visualizer.vigenere.wrappedDecrypt')
                : ''}
            </p>
          </div>

          {/* Cadran circulaire de César avec décalage de la lettre courante */}
          <CaesarDial
            step={toDialStep(step)}
            mode={mode}
            stepDurationMs={stepDurationMs}
            className="mx-auto max-h-[28svh] max-w-[14rem]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
