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

/**
 * Niveau de difficulté d'un algorithme cryptographique.
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Opération disponible pour un algorithme dans le laboratoire ou la cryptanalyse.
 */
export type AlgorithmOperation =
  | 'encrypt'
  | 'decrypt'
  | 'bruteForce'
  | 'buildAlphabet'
  | 'frequencyAnalysis'
  | 'inversePermutation'
  | 'permutationSearch'
  | 'assistedCryptanalysis';

/**
 * Liste ordonnée des niveaux de difficulté, du plus simple au plus complexe.
 */
export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Métadonnées pédagogiques associées à chaque algorithme : difficulté et opérations disponibles.
 */
export const ALGORITHM_META: Record<
  AlgorithmId,
  { difficulty: Difficulty; operations: readonly AlgorithmOperation[] }
> = {
  caesar: {
    difficulty: 'beginner',
    operations: ['encrypt', 'decrypt', 'bruteForce'],
  },
  substitution: {
    difficulty: 'intermediate',
    operations: ['buildAlphabet', 'encrypt', 'decrypt', 'frequencyAnalysis'],
  },
  permutation: {
    difficulty: 'intermediate',
    operations: ['encrypt', 'decrypt', 'inversePermutation', 'permutationSearch'],
  },
  vigenere: {
    difficulty: 'advanced',
    operations: ['encrypt', 'decrypt', 'assistedCryptanalysis'],
  },
};
