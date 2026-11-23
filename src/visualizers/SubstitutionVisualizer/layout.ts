/**
 * Constantes et fonctions de disposition géométrique pour le visualiseur de substitution.
 */

/**
 * Nombre de colonnes par bande d'alphabet (13 lettres par bande pour couvrir les 26 lettres en 2 rangées).
 */
export const BAND_SIZE = 13;

/**
 * Position géométrique d'une cellule dans la grille de substitution (bande et colonne).
 */
export interface CellPosition {
  /** Index de la bande : 0 pour la première moitié (A-M), 1 pour la seconde (N-Z) */
  band: 0 | 1;
  /** Index de la colonne au sein de la bande (0 à 12) */
  column: number;
}

/**
 * Calcule la bande (0 ou 1) et la colonne (0 à 12) correspondant à un indice alphabétique (0 à 25).
 *
 * @param index - Indice de la lettre dans l'alphabet de base (0 pour A, 25 pour Z).
 * @returns Objet décrivant la bande (0 ou 1) et l'indice de colonne (0 à 12).
 */
export function cellPosition(index: number): CellPosition {
  const band = index >= BAND_SIZE ? 1 : 0;
  const column = ((index % BAND_SIZE) + BAND_SIZE) % BAND_SIZE;
  return { band, column };
}
