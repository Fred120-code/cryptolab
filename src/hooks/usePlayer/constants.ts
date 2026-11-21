/**
 * Vitesses de lecture disponibles pour le lecteur d'étapes.
 */
export const SPEEDS = [0.5, 1, 1.5, 2, 3] as const;

/**
 * Type représentant l'une des vitesses de lecture permises.
 */
export type Speed = (typeof SPEEDS)[number];

/**
 * Vitesse de lecture par défaut (1x).
 */
export const DEFAULT_SPEED: Speed = 1;

/**
 * Intervalle de base en millisecondes entre deux étapes à vitesse 1x (1200 ms).
 */
export const DEFAULT_BASE_INTERVAL_MS = 1200;
