/**
 * Constantes et calculs géométriques pour le visualiseur de permutation de blocs.
 */

/** Largeur du canevas SVG virtuel */
export const VIEW_WIDTH = 400;

/** Hauteur du canevas SVG virtuel */
export const VIEW_HEIGHT = 300;

/** Position Y du libellé du bloc d'entrée */
export const LABEL_TOP_Y = 18;

/** Position Y des numéros de colonne d'entrée */
export const NUMBERS_TOP_Y = 44;

/** Position Y du centre des cases du bloc d'entrée */
export const TOP_Y = 84;

/** Position Y du centre des cases du bloc de sortie */
export const BOTTOM_Y = 216;

/** Position Y des numéros de colonne de sortie */
export const NUMBERS_BOTTOM_Y = 256;

/** Position Y du libellé du bloc de sortie */
export const LABEL_BOTTOM_Y = 282;

/**
 * Calcule l'écartement horizontal entre les centres de deux cases consécutives.
 *
 * @param n - Taille du bloc (nombre de colonnes).
 * @returns Écartement en pixels SVG.
 */
export function pitch(n: number): number {
  return Math.min(48, 380 / n);
}

/**
 * Calcule la largeur et la hauteur d'une case carrée en fonction de la taille du bloc.
 *
 * @param n - Taille du bloc.
 * @returns Dimension en pixels SVG.
 */
export function cellSize(n: number): number {
  return Math.min(40, pitch(n) - 4);
}

/**
 * Calcule la position X du centre d'une case pour un indice de colonne donné.
 *
 * Les cases sont centrées horizontalement autour de X = 200.
 *
 * @param index - Indice de la colonne (0 à n - 1).
 * @param n - Nombre total de colonnes (taille du bloc).
 * @returns Coordonnée X en pixels SVG.
 */
export function cellCenterX(index: number, n: number): number {
  return 200 + (index - (n - 1) / 2) * pitch(n);
}

/**
 * Interpolation linéaire entre deux valeurs numériques.
 *
 * @param a - Valeur de départ.
 * @param b - Valeur d'arrivée.
 * @param t - Facteur d'interpolation (normalement entre 0 et 1).
 * @returns Valeur interpolée.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Fonction d'adoucissement cubique (ease-in-out) bornée entre 0 et 1.
 *
 * @param t - Facteur temporel linéaire.
 * @returns Facteur d'adoucissement adouci entre 0 et 1.
 */
export function easeInOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Calcule la progression individuelle d'un jeton en fonction de la progression globale
 * et de son ordre d'arrivée décalé dans le bloc.
 *
 * Le départ de chaque jeton est échelonné sur les premiers 50 % de l'animation globale,
 * et chaque déplacement individuel dure 50 % de la durée totale.
 *
 * @param progress - Progression globale de l'étape (entre 0 et 1).
 * @param order - Ordre d'arrivée du jeton (indice de destination `to`, de 0 à n - 1).
 * @param n - Taille du bloc.
 * @returns Progression locale adoucie (exactement 0 quand progress = 0, exactement 1 quand progress = 1).
 */
export function tokenProgress(progress: number, order: number, n: number): number {
  const start = (order / n) * 0.5;
  const localT = Math.max(0, Math.min(1, (progress - start) / 0.5));
  return easeInOut(localT);
}
