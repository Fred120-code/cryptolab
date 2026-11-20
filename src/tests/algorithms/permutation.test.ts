import { describe, expect, it } from 'vitest';
import {
  getPaddingLength,
  invertPermutation,
  parsePermutation,
  validate,
  validateCiphertext,
} from '@/algorithms/permutation';

describe('Permutation cipher - parsing, validation, inversion and padding', () => {
  describe('parsePermutation', () => {
    it('découpe les virgules, espaces et points-virgules', () => {
      expect(parsePermutation('2,4,1,3')).toEqual([2, 4, 1, 3]);
      expect(parsePermutation('2 4 1 3')).toEqual([2, 4, 1, 3]);
      expect(parsePermutation('2; 4;1 3')).toEqual([2, 4, 1, 3]);
    });

    it('gère une chaîne vide', () => {
      expect(parsePermutation('')).toEqual([]);
      expect(parsePermutation('   ')).toEqual([]);
    });

    it('convertit un fragment invalide en NaN', () => {
      const parsed = parsePermutation('2, foo, 1');
      expect(parsed[0]).toBe(2);
      expect(Number.isNaN(parsed[1])).toBe(true);
      expect(parsed[2]).toBe(1);
    });
  });

  describe('invertPermutation', () => {
    it('calcule correctement l’inverse de [2, 4, 1, 3]', () => {
      expect(invertPermutation([2, 4, 1, 3])).toEqual([3, 1, 4, 2]);
    });

    it('vérifie que [3, 5, 1, 4, 2] est sa propre inverse (involution)', () => {
      expect(invertPermutation([3, 5, 1, 4, 2])).toEqual([3, 5, 1, 4, 2]);
    });

    it('vérifie que inverse(inverse(p)) === p pour toutes les permutations de taille 3 et 4', () => {
      const testCases: number[][] = [
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [2, 4, 1, 3],
        [3, 1, 4, 2],
      ];

      for (const p of testCases) {
        expect(invertPermutation(invertPermutation(p))).toEqual(p);
      }
    });

    it('lève une exception si la permutation est invalide', () => {
      expect(() => invertPermutation([1, 1, 2])).toThrowError();
      expect(() => invertPermutation([1])).toThrowError();
    });
  });

  describe('getPaddingLength', () => {
    it('calcule correctement les longueurs de remplissage', () => {
      expect(getPaddingLength(8, 5)).toBe(2);
      expect(getPaddingLength(12, 4)).toBe(0);
      expect(getPaddingLength(0, 4)).toBe(0);
      expect(getPaddingLength(1, 4)).toBe(3);
    });
  });

  describe('validate', () => {
    it('accepte les permutations valides de taille 2 à 16', () => {
      expect(validate({ permutation: [2, 4, 1, 3] })).toEqual({ valid: true });
      expect(validate({ permutation: [3, 5, 1, 4, 2] })).toEqual({ valid: true });
      expect(validate({ permutation: [2, 1] })).toEqual({ valid: true });
    });

    it('rejette les tailles hors de [2, 16]', () => {
      const tooShort = validate({ permutation: [1] });
      expect(tooShort.valid).toBe(false);

      const tooLong = validate({
        permutation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      });
      expect(tooLong.valid).toBe(false);
    });

    it('rejette les doublons et les valeurs manquantes', () => {
      const res = validate({ permutation: [1, 1, 3] });
      expect(res.valid).toBe(false);
      if (!res.valid) {
        const keys = res.errors.map((e) => e.key);
        expect(keys).toContain('permutation.errors.duplicateValues');
        expect(keys).toContain('permutation.errors.missingValues');
      }
    });

    it('rejette les valeurs hors plage', () => {
      const res = validate({ permutation: [0, 2, 5] });
      expect(res.valid).toBe(false);
      if (!res.valid) {
        const keys = res.errors.map((e) => e.key);
        expect(keys).toContain('permutation.errors.outOfRange');
      }
    });

    it('rejette les valeurs non entières et NaN', () => {
      const withFloat = validate({ permutation: [1.5, 2, 3] });
      expect(withFloat.valid).toBe(false);

      const withNaN = validate({ permutation: [NaN, 1, 2] });
      expect(withNaN.valid).toBe(false);
    });

    it('valide paddingLength lorsqu’il est fourni', () => {
      expect(validate({ permutation: [2, 1], paddingLength: 0 })).toEqual({ valid: true });
      expect(validate({ permutation: [2, 1], paddingLength: 1 })).toEqual({ valid: true });

      const invalidPadding = validate({ permutation: [2, 1], paddingLength: 2 });
      expect(invalidPadding.valid).toBe(false);

      const negativePadding = validate({ permutation: [2, 1], paddingLength: -1 });
      expect(negativePadding.valid).toBe(false);
    });

    it('gère proprement un paramètre qui n’est pas un tableau', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bad = validate({ permutation: null as any });
      expect(bad.valid).toBe(false);
    });
  });

  describe('validateCiphertext', () => {
    it('accepte une longueur multiple de la taille de bloc', () => {
      expect(validateCiphertext('ABCDEFGH', { permutation: [2, 4, 1, 3] })).toEqual({
        valid: true,
      });
    });

    it('rejette une longueur non multiple', () => {
      const res = validateCiphertext('ABCDEFG', { permutation: [2, 4, 1, 3] });
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.errors[0]?.key).toBe('permutation.errors.ciphertextLengthNotMultiple');
        expect(res.errors[0]?.params?.['length']).toBe(7);
        expect(res.errors[0]?.params?.['blockSize']).toBe(4);
      }
    });
  });
});
