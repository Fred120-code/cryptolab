import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { SPEEDS, type PlayerApi } from '@/hooks/usePlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Interface pour les libellés internationalisables des contrôles du lecteur.
 * Aucun texte visible ou accessible n'est écrit en dur dans le composant.
 */
export interface PlayerControlsLabels {
  /** Libellé du bouton Recommencer */
  restart: string;
  /** Libellé du bouton Étape précédente */
  previous: string;
  /** Libellé du bouton Lecture */
  play: string;
  /** Libellé du bouton Pause */
  pause: string;
  /** Libellé du bouton Étape suivante */
  next: string;
  /** Libellé accessible du sélecteur de vitesse */
  speed: string;
  /** Libellé accessible de la barre de progression / curseur */
  progress: string;
  /** Fonction formatant l'indicateur d'étape (ex: (c, t) => `${c} / ${t}`) */
  stepOf: (current: number, total: number) => string;
  /** Fonction formatant l'affichage d'une vitesse dans le sélecteur (ex: (s) => `${s}x`) */
  speedOption: (speed: number) => string;
}

/**
 * Propriétés attendues par le composant `PlayerControls`.
 */
export interface PlayerControlsProps {
  /** API retournée par le hook `usePlayer` */
  player: PlayerApi<unknown>;
  /** Dictionnaire de libellés injectés */
  labels: PlayerControlsLabels;
}

/**
 * Composant présentationnel pur contrôlant l'animation de visualisation pas à pas.
 *
 * Éléments natifs accessibles (clavier, cibles tactiles >= 44x44px, focus-visible).
 * Ne contient aucun texte en dur (tout est fourni via les `labels`).
 *
 * @param props Propriétés incluant le contrôleur de lecture et les libellés.
 */
export function PlayerControls({ player, labels }: PlayerControlsProps) {
  const {
    currentIndex,
    totalSteps,
    isPlaying,
    speed,
    isFirst,
    isLast,
    restart,
    previous,
    toggle,
    next,
    goTo,
    setSpeed,
  } = player;

  const isZeroSteps = totalSteps === 0;
  const isRestartDisabled = isZeroSteps || isFirst;
  const isPreviousDisabled = isZeroSteps || isFirst;
  const isPlayDisabled = totalSteps <= 1;
  const isNextDisabled = isZeroSteps || isLast;

  const currentStepNumber = isZeroSteps ? 0 : currentIndex + 1;
  const stepText = labels.stepOf(currentStepNumber, totalSteps);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {/* Barre de progression / curseur direct */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentIndex}
            onChange={(e) => goTo(Number(e.target.value))}
            disabled={isZeroSteps}
            aria-label={labels.progress}
            aria-valuetext={stepText}
            className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span className="shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground sm:min-w-[5rem] sm:text-right">
            {stepText}
          </span>
        </div>

        {/* Barre de boutons et sélecteur de vitesse */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Contrôles de transport */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              onClick={restart}
              disabled={isRestartDisabled}
              aria-label={labels.restart}
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              onClick={previous}
              disabled={isPreviousDisabled}
              aria-label={labels.previous}
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              size="icon"
              className="size-11"
              onClick={toggle}
              disabled={isPlayDisabled}
              aria-label={isPlaying ? labels.pause : labels.play}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              onClick={next}
              disabled={isNextDisabled}
              aria-label={labels.next}
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Sélecteur de vitesse */}
          <div className="flex items-center gap-2">
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isZeroSteps}
              aria-label={labels.speed}
              className="h-11 min-h-[44px] rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {labels.speedOption(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
