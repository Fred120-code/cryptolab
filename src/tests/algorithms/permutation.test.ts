import { describe, expect, it } from 'vitest';
import {
  decrypt,
  encrypt,
  getPaddingLength,
  getSteps,
  invertPermutation,
  parsePermutation,
  permutationAlgorithm,
  validate,
  validateCiphertext,
} from '@/algorithms/permutation';
import { normalizeLetters } from '@/utils/text';

describe('Permutation cipher - encrypt, decrypt and execution steps', () => {
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

  describe('encrypt et decrypt', () => {
    it('chiffre INFORMATIQUE avec [2, 4, 1, 3] en NOIFMTRAQEIU sans remplissage', () => {
      const plain = 'INFORMATIQUE';
      const p = [2, 4, 1, 3];
      const encrypted = encrypt(plain, { permutation: p });
      expect(encrypted).toBe('NOIFMTRAQEIU');
      expect(decrypt(encrypted, { permutation: p })).toBe(plain);
    });

    it('chiffre SECURITE avec [3, 5, 1, 4, 2] en CRSUEEXIXT avec 2 X de remplissage', () => {
      const plain = 'SECURITE';
      const p = [3, 5, 1, 4, 2];
      const encrypted = encrypt(plain, { permutation: p });
      expect(encrypted).toBe('CRSUEEXIXT');
      // Sans paddingLength, les X de remplissage restent à la fin
      expect(decrypt(encrypted, { permutation: p })).toBe('SECURITEXX');
      // Avec paddingLength: 2, les 2 X sont retirés
      expect(decrypt(encrypted, { permutation: p, paddingLength: 2 })).toBe(plain);
    });

    /**
     * Test de l'ambiguïté du X :
     * "MAX" (3 lettres) avec padding de bloc 4 devient "MAXX" après remplissage.
     * "MAXX" (4 lettres) sans remplissage a les mêmes lettres.
     * Les deux produisent exactement le même texte chiffré "AXMX".
     * Au déchiffrement, sans indication de paddingLength, le moteur produit "MAXX".
     * Fournir paddingLength: 1 permet de restituer fidèlement "MAX".
     */
    it('illustre l’ambiguïté du caractère de remplissage X', () => {
      const p = [2, 4, 1, 3];
      expect(encrypt('MAX', { permutation: p })).toBe('AXMX');
      expect(encrypt('MAXX', { permutation: p })).toBe('AXMX');

      // Sans paddingLength -> "MAXX"
      expect(decrypt('AXMX', { permutation: p })).toBe('MAXX');
      // Avec paddingLength: 1 -> "MAX"
      expect(decrypt('AXMX', { permutation: p, paddingLength: 1 })).toBe('MAX');
      // Avec paddingLength: 0 -> "MAXX"
      expect(decrypt('AXMX', { permutation: p, paddingLength: 0 })).toBe('MAXX');
    });

    it('vérifie la propriété de réversibilité pour différentes permutations et textes', () => {
      const permutations = [
        [2, 1],
        [1, 3, 2],
        [3, 1, 2],
        [2, 4, 1, 3],
        [4, 3, 2, 1],
      ];

      const texts = ['A', 'HELLO', 'INFORMATIQUE', 'Élève, bien reçu ! 2026.', ''];

      for (const p of permutations) {
        for (const text of texts) {
          const norm = normalizeLetters(text);
          const padLen = getPaddingLength(norm.length, p.length);
          const enc = encrypt(text, { permutation: p });
          const dec = decrypt(enc, { permutation: p, paddingLength: padLen });
          expect(dec).toBe(norm);
        }
      }
    });

    it('gère une chaîne vide ou sans lettre alphabétique', () => {
      const p = [2, 4, 1, 3];
      expect(encrypt('', { permutation: p })).toBe('');
      expect(encrypt('   12345 !? ', { permutation: p })).toBe('');
      expect(decrypt('', { permutation: p })).toBe('');
    });

    it('lève une exception si la longueur du texte à déchiffrer n’est pas un multiple', () => {
      expect(() => decrypt('ABCDEFG', { permutation: [2, 4, 1, 3] })).toThrowError();
    });

    it('lève une exception si les paramètres sont invalides', () => {
      expect(() => encrypt('TEST', { permutation: [1] })).toThrowError();
      expect(() => decrypt('TEST', { permutation: [1] })).toThrowError();
    });

    it('expose l’instance permutationAlgorithm avec id permutation', () => {
      expect(permutationAlgorithm.id).toBe('permutation');
      expect(permutationAlgorithm.encrypt('ABCD', { permutation: [2, 4, 1, 3] })).toBe('BDAC');
    });
  });

  describe('getSteps', () => {
    it('produit un output identique à encrypt en mode encrypt et decrypt en mode decrypt', () => {
      const text = 'SECURITE';
      const params = { permutation: [3, 5, 1, 4, 2] };

      const encSteps = getSteps(text, params, 'encrypt');
      expect(encSteps.output).toBe(encrypt(text, params));
      expect(encSteps.input).toBe(text);

      const decSteps = getSteps(encSteps.output, { ...params, paddingLength: 2 }, 'decrypt');
      expect(decSteps.output).toBe(decrypt(encSteps.output, { ...params, paddingLength: 2 }));
      expect(decSteps.output).toBe('SECURITE');
    });

    it('génère un nombre d’étapes égal au nombre de blocs avec index consécutifs depuis 0', () => {
      const p = [3, 5, 1, 4, 2];
      const result = getSteps('SECURITE', { permutation: p }, 'encrypt');

      // 8 lettres normalisées + 2 'X' de padding = 10 lettres => 2 blocs de 5
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0]?.index).toBe(0);
      expect(result.steps[1]?.index).toBe(1);

      // Première étape : SECUR -> CRSUE (pas de remplissage)
      expect(result.steps[0]?.input).toBe('SECUR');
      expect(result.steps[0]?.output).toBe('CRSUE');
      expect(result.steps[0]?.calculation).toBe('SECUR → CRSUE');
      expect(result.steps[0]?.data.paddingCount).toBe(0);
      expect(result.steps[0]?.data.hasPadding).toBe(false);

      // Seconde étape : ITEXX -> EXIXT (2 X de remplissage)
      expect(result.steps[1]?.input).toBe('ITEXX');
      expect(result.steps[1]?.output).toBe('EXIXT');
      expect(result.steps[1]?.calculation).toBe('ITEXX → EXIXT');
      expect(result.steps[1]?.data.paddingCount).toBe(2);
      expect(result.steps[1]?.data.hasPadding).toBe(true);

      // Vérifie les moves de la 2e étape : 'X' provient des indices 3 et 4 de ITEXX (donc isPadding vrai)
      const moves = result.steps[1]!.data.moves;
      expect(moves).toHaveLength(5);
      const paddingMoves = moves.filter((m) => m.isPadding);
      expect(paddingMoves).toHaveLength(2);
      expect(paddingMoves[0]?.char).toBe('X');
      expect(paddingMoves[1]?.char).toBe('X');

      // Reconstitution du bloc de sortie depuis les moves
      const reconstructed = moves.map((m) => m.char).join('');
      expect(reconstructed).toBe(result.steps[1]?.output);
    });

    it('marque correctement isPadding au déchiffrement avec paddingLength', () => {
      const p = [3, 5, 1, 4, 2];
      const ciphertext = 'CRSUEEXIXT'; // 10 lettres, paddingLength = 2
      const result = getSteps(ciphertext, { permutation: p, paddingLength: 2 }, 'decrypt');

      expect(result.steps).toHaveLength(2);
      expect(result.output).toBe('SECURITE'); // Output final sans les 2 X de padding
      expect(result.steps[1]?.output).toBe('ITEXX'); // Output d'étape reste le bloc complet

      const movesBlock2 = result.steps[1]!.data.moves;
      // Dans le bloc 2 déchiffré (ITEXX), les caractères aux positions to = 3 et to = 4 sont du padding
      const paddingMoves = movesBlock2.filter((m) => m.isPadding);
      expect(paddingMoves).toHaveLength(2);
      expect(paddingMoves[0]?.to).toBe(3);
      expect(paddingMoves[1]?.to).toBe(4);
    });

    it('gère une chaîne vide (zéro étape)', () => {
      const result = getSteps('', { permutation: [2, 1] }, 'encrypt');
      expect(result.steps).toEqual([]);
      expect(result.output).toBe('');
    });

    it('lève une exception pour des paramètres invalides ou longueur non multiple en déchiffrement', () => {
      expect(() => getSteps('TEST', { permutation: [1] }, 'encrypt')).toThrowError();
      expect(() => getSteps('ABCDEFG', { permutation: [2, 4, 1, 3] }, 'decrypt')).toThrowError();
    });
  });
});
