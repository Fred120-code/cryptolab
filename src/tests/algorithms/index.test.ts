import { describe, expect, it } from 'vitest';
import { caesarAlgorithm, permutationAlgorithm, substitutionAlgorithm } from '@/algorithms';

describe('src/algorithms/index.ts', () => {
  it('ré-exporte tous les algorithmes sans conflit de nommage avec leurs bons identifiants', () => {
    expect(caesarAlgorithm).toBeDefined();
    expect(caesarAlgorithm.id).toBe('caesar');

    expect(substitutionAlgorithm).toBeDefined();
    expect(substitutionAlgorithm.id).toBe('substitution');

    expect(permutationAlgorithm).toBeDefined();
    expect(permutationAlgorithm.id).toBe('permutation');
  });
});
