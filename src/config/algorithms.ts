import type { AlgorithmId } from '@/types';

/**
 * Identifiants uniques ordonnés de tous les algorithmes cryptographiques supportés.
 */
export const ALGORITHM_IDS: readonly AlgorithmId[] = [
  'caesar',
  'substitution',
  'permutation',
  'vigenere',
];

/**
 * Vérifie si une valeur quelconque correspond à un identifiant d'algorithme valide.
 *
 * @param value Valeur à tester.
 * @returns `true` si la valeur est un `AlgorithmId`, sinon `false`.
 */
export function isAlgorithmId(value: unknown): value is AlgorithmId {
  return typeof value === 'string' && ALGORITHM_IDS.includes(value as AlgorithmId);
}
