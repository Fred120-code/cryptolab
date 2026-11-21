import { useCallback, useEffect, useReducer, useState } from 'react';
import type { ExecutionStep } from '@/types';
import { DEFAULT_BASE_INTERVAL_MS, DEFAULT_SPEED, SPEEDS, type Speed } from './constants';
import { playerReducer, type PlayerState } from './playerReducer';

/**
 * Options de configuration du hook `usePlayer`.
 */
export interface UsePlayerOptions {
  /**
   * Intervalle de base en millisecondes entre deux étapes à vitesse 1x (défaut : 1200 ms).
   */
  baseIntervalMs?: number;
  /**
   * Vitesse de lecture initiale (défaut : 1x).
   */
  initialSpeed?: number;
}

/**
 * Interface publique retournée par le hook `usePlayer` pour contrôler la visualisation.
 */
export interface PlayerApi<TData> {
  /** Index de l'étape courante (basé sur 0) */
  currentIndex: number;
  /** Données de l'étape courante ou `undefined` si aucune étape n'est disponible */
  currentStep: ExecutionStep<TData> | undefined;
  /** Nombre total d'étapes */
  totalSteps: number;
  /** Indique si la lecture automatique est en cours */
  isPlaying: boolean;
  /** Vitesse de lecture actuelle */
  speed: number;
  /** Indique si l'index est sur la première étape */
  isFirst: boolean;
  /** Indique si l'index est sur la dernière étape (ou si totalSteps = 0) */
  isLast: boolean;
  /** Progression relative comprise entre 0 et 1 (0 si totalSteps = 0, sinon (currentIndex + 1) / totalSteps) */
  progress: number;
  /** Démarre la lecture automatique */
  play: () => void;
  /** Met la lecture automatique en pause */
  pause: () => void;
  /** Bascule entre lecture et pause */
  toggle: () => void;
  /** Avance à l'étape suivante et met en pause */
  next: () => void;
  /** Recule à l'étape précédente et met en pause */
  previous: () => void;
  /** Revient à l'étape 0 et met en pause */
  restart: () => void;
  /** Navigue directement vers un index donné et met en pause */
  goTo: (index: number) => void;
  /** Définit la vitesse de lecture parmi les vitesses permises */
  setSpeed: (speed: number) => void;
}

/**
 * Hook contrôlant l'animation pas à pas d'un algorithme cryptographique.
 *
 * Moteur pur et indépendant des algorithmes particuliers : il consomme uniquement un tableau
 * d'étapes `ExecutionStep<TData>[]`.
 *
 * IMPORTANT : L'appelant doit mémoïser le tableau `steps` (via `useMemo`) pour éviter des réinitialisations
 * intempestives lors des ré-affichages de composants parents.
 *
 * @template TData Type des données spécifiques de l'algorithme contenues dans chaque étape.
 * @param steps Tableau des étapes calculées à visualiser.
 * @param options Options d'intervalle et de vitesse initiale.
 * @returns L'API de contrôle et l'état courant de lecture.
 */
export function usePlayer<TData>(
  steps: readonly ExecutionStep<TData>[],
  options?: UsePlayerOptions,
): PlayerApi<TData> {
  const baseIntervalMs = options?.baseIntervalMs ?? DEFAULT_BASE_INTERVAL_MS;
  const initialSpeed =
    options?.initialSpeed && SPEEDS.includes(options.initialSpeed as Speed)
      ? options.initialSpeed
      : DEFAULT_SPEED;

  const [state, dispatch] = useReducer(playerReducer, {
    currentIndex: 0,
    isPlaying: false,
    speed: initialSpeed,
    totalSteps: steps.length,
  } satisfies PlayerState);

  // Ajustement synchrone de l'état pendant le rendu lors d'un changement de référence de `steps`
  const [prevSteps, setPrevSteps] = useState(steps);
  if (prevSteps !== steps) {
    setPrevSteps(steps);
    dispatch({ type: 'reset', totalSteps: steps.length });
  }

  // Minuteur de lecture automatique via setTimeout
  useEffect(() => {
    if (!state.isPlaying) {
      return;
    }

    const interval = baseIntervalMs / state.speed;
    const timerId = setTimeout(() => {
      dispatch({ type: 'tick' });
    }, interval);

    return () => {
      clearTimeout(timerId);
    };
  }, [state.isPlaying, state.currentIndex, state.speed, baseIntervalMs]);

  // Actions mémoïsées à identité stable
  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const previous = useCallback(() => dispatch({ type: 'previous' }), []);
  const restart = useCallback(() => dispatch({ type: 'restart' }), []);
  const goTo = useCallback((index: number) => dispatch({ type: 'goTo', index }), []);
  const setSpeed = useCallback((speed: number) => dispatch({ type: 'setSpeed', speed }), []);

  const totalSteps = state.totalSteps;
  const currentIndex = state.currentIndex;
  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = totalSteps === 0 || currentIndex >= totalSteps - 1;
  const progress = totalSteps === 0 ? 0 : (currentIndex + 1) / totalSteps;

  return {
    currentIndex,
    currentStep,
    totalSteps,
    isPlaying: state.isPlaying,
    speed: state.speed,
    isFirst,
    isLast,
    progress,
    play,
    pause,
    toggle,
    next,
    previous,
    restart,
    goTo,
    setSpeed,
  };
}
