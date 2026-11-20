import { describe, expect, it } from 'vitest';
import {
  caesarAlgorithm,
  decrypt,
  encrypt,
  getSteps,
  normalizeShift,
  validate,
} from '@/algorithms/caesar';

describe('Caesar cipher - encrypt, decrypt and validation', () => {
  describe('normalizeShift', () => {
    it('normalise les décalages positifs et négatifs', () => {
      expect(normalizeShift(0)).toBe(0);
      expect(normalizeShift(3)).toBe(3);
      expect(normalizeShift(26)).toBe(0);
      expect(normalizeShift(29)).toBe(3);
      expect(normalizeShift(52)).toBe(0);
      expect(normalizeShift(-3)).toBe(23);
      expect(normalizeShift(-26)).toBe(0);
      expect(normalizeShift(-29)).toBe(23);
    });
  });

  describe('validate', () => {
    it('accepte les entiers (positifs, nuls, négatifs, grands)', () => {
      expect(validate({ shift: 0 })).toEqual({ valid: true });
      expect(validate({ shift: 3 })).toEqual({ valid: true });
      expect(validate({ shift: -5 })).toEqual({ valid: true });
      expect(validate({ shift: 100 })).toEqual({ valid: true });
    });

    it('rejette les non-entiers et valeurs non finies', () => {
      const floatCheck = validate({ shift: 1.5 });
      expect(floatCheck.valid).toBe(false);
      if (!floatCheck.valid) {
        expect(floatCheck.errors[0]?.key).toBe('caesar.errors.shiftNotInteger');
        expect(floatCheck.errors[0]?.params?.['value']).toBe('1.5');
      }

      expect(validate({ shift: NaN }).valid).toBe(false);
      expect(validate({ shift: Infinity }).valid).toBe(false);
      expect(validate({ shift: -Infinity }).valid).toBe(false);
    });
  });

  describe('encrypt et decrypt', () => {
    it('chiffre BONJOUR avec la clé 3 en ERQMRXU', () => {
      expect(encrypt('BONJOUR', { shift: 3 })).toBe('ERQMRXU');
      expect(decrypt('ERQMRXU', { shift: 3 })).toBe('BONJOUR');
    });

    it('chiffre EXAMEN avec la clé 7 en LEHTLU', () => {
      expect(encrypt('EXAMEN', { shift: 7 })).toBe('LEHTLU');
      expect(decrypt('LEHTLU', { shift: 7 })).toBe('EXAMEN');
    });

    it('gère le passage circulaire de Z à A', () => {
      expect(encrypt('X', { shift: 7 })).toBe('E');
      expect(decrypt('E', { shift: 7 })).toBe('X');
      expect(encrypt('Z', { shift: 1 })).toBe('A');
      expect(decrypt('A', { shift: 1 })).toBe('Z');
    });

    it('préserve la casse des lettres', () => {
      expect(encrypt('Bonjour Monde!', { shift: 3 })).toBe('Erqmrxu Prqgh!');
      expect(decrypt('Erqmrxu Prqgh!', { shift: 3 })).toBe('Bonjour Monde!');
    });

    it('laisse inchangés les espaces, chiffres, ponctuation et accents', () => {
      const original = "L'été 2026 sera génial ! (100%)";
      const encrypted = encrypt(original, { shift: 5 });
      expect(encrypted).toBe("Q'éyé 2026 xjwf lésnfq ! (100%)");
      expect(decrypt(encrypted, { shift: 5 })).toBe(original);
    });

    it('gère une chaîne vide', () => {
      expect(encrypt('', { shift: 12 })).toBe('');
      expect(decrypt('', { shift: 12 })).toBe('');
    });

    it('est cohérent avec les clés équivalentes modulo 26 (0, 26, 29, -3, -29, 52)', () => {
      const sample = 'CryptoLab';
      expect(encrypt(sample, { shift: 0 })).toBe(sample);
      expect(encrypt(sample, { shift: 26 })).toBe(sample);
      expect(encrypt(sample, { shift: 52 })).toBe(sample);

      expect(encrypt(sample, { shift: 29 })).toBe(encrypt(sample, { shift: 3 }));
      expect(encrypt(sample, { shift: -3 })).toBe(encrypt(sample, { shift: 23 }));
      expect(encrypt(sample, { shift: -29 })).toBe(encrypt(sample, { shift: 23 }));
    });

    it('lève une erreur en cas de paramètres invalides', () => {
      expect(() => encrypt('test', { shift: 2.5 })).toThrowError();
      expect(() => decrypt('test', { shift: NaN })).toThrowError();
    });

    it('vérifie la propriété de réversibilité decrypt(encrypt(x)) === x pour toutes les clés de -60 à 60', () => {
      const samples = [
        'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
        'chiffrement de César classique avec accents (é, è, ê) & chiffres 12345!',
        'ABC xyz ABC xyz',
        '',
      ];

      for (let k = -60; k <= 60; k++) {
        for (const sample of samples) {
          const enc = encrypt(sample, { shift: k });
          const dec = decrypt(enc, { shift: k });
          expect(dec).toBe(sample);
        }
      }
    });

    it("vérifie que l'objet caesarAlgorithm expose id 'caesar' et les méthodes requises", () => {
      expect(caesarAlgorithm.id).toBe('caesar');
      expect(caesarAlgorithm.encrypt('ABC', { shift: 1 })).toBe('BCD');
      expect(caesarAlgorithm.decrypt('BCD', { shift: 1 })).toBe('ABC');
    });
  });

  describe('getSteps', () => {
    it("lève une erreur si les paramètres sont invalides lors de l'appel à getSteps", () => {
      expect(() => getSteps('test', { shift: 1.5 }, 'encrypt')).toThrowError();
      expect(() => getSteps('test', { shift: NaN }, 'decrypt')).toThrowError();
    });

    it('produit un output identique à encrypt en mode encrypt et decrypt en mode decrypt', () => {
      const text = 'Hello, World! 123';
      const params = { shift: 4 };

      const encSteps = getSteps(text, params, 'encrypt');
      expect(encSteps.output).toBe(encrypt(text, params));
      expect(encSteps.input).toBe(text);

      const decSteps = getSteps(encSteps.output, params, 'decrypt');
      expect(decSteps.output).toBe(decrypt(encSteps.output, params));
      expect(decSteps.output).toBe(text);
      expect(decSteps.input).toBe(encSteps.output);
    });

    it('génère un nombre détapes exactement égal au nombre de lettres ASCII', () => {
      const text = 'A1 b2 C3!'; // Lettres: A, b, C => 3 lettres
      const result = getSteps(text, { shift: 3 }, 'encrypt');

      expect(result.steps).toHaveLength(3);
      expect(result.output).toBe('D1 e2 F3!');
    });

    it('génère des index consécutifs commençant à 0', () => {
      const text = 'BONJOUR';
      const result = getSteps(text, { shift: 3 }, 'encrypt');

      expect(result.steps).toHaveLength(7);
      result.steps.forEach((step, idx) => {
        expect(step.index).toBe(idx);
      });
    });

    it('définit wrapped = true lorsque le calcul dépasse Z ou passe sous A', () => {
      // Chiffrement: 'X' (23) avec shift 7 => 23 + 7 = 30 >= 26 => wrapped true, output 'E' (4)
      const encWrapped = getSteps('X', { shift: 7 }, 'encrypt');
      expect(encWrapped.steps[0]?.data.wrapped).toBe(true);
      expect(encWrapped.steps[0]?.data.inputIndex).toBe(23);
      expect(encWrapped.steps[0]?.data.outputIndex).toBe(4);
      expect(encWrapped.steps[0]?.output).toBe('E');
      expect(encWrapped.steps[0]?.calculation).toBe('(23 + 7) mod 26 = 4');

      // Chiffrement non wrapped: 'A' (0) avec shift 3 => 0 + 3 = 3 < 26 => wrapped false
      const encNoWrap = getSteps('A', { shift: 3 }, 'encrypt');
      expect(encNoWrap.steps[0]?.data.wrapped).toBe(false);
      expect(encNoWrap.steps[0]?.calculation).toBe('(0 + 3) mod 26 = 3');

      // Déchiffrement wrapped: 'B' (1) avec shift 3 => 1 - 3 = -2 < 0 => wrapped true, output 'Y' (24)
      const decWrapped = getSteps('B', { shift: 3 }, 'decrypt');
      expect(decWrapped.steps[0]?.data.wrapped).toBe(true);
      expect(decWrapped.steps[0]?.output).toBe('Y');
      expect(decWrapped.steps[0]?.calculation).toBe('(1 - 3) mod 26 = 24');

      // Déchiffrement non wrapped: 'D' (3) avec shift 3 => 3 - 3 = 0 >= 0 => wrapped false
      const decNoWrap = getSteps('D', { shift: 3 }, 'decrypt');
      expect(decNoWrap.steps[0]?.data.wrapped).toBe(false);
      expect(decNoWrap.steps[0]?.calculation).toBe('(3 - 3) mod 26 = 0');
    });

    it('associe la clé normalisée et les explications traduisibles avec paramètres', () => {
      const result = getSteps('B', { shift: 29 }, 'encrypt'); // 29 mod 26 = 3
      expect(result.steps[0]?.key).toBe(3);
      expect(result.steps[0]?.data.shift).toBe(3);
      expect(result.steps[0]?.data.rawShift).toBe(29);
      expect(result.steps[0]?.data.position).toBe(0);
      expect(result.steps[0]?.data.isUpper).toBe(true);
      expect(result.steps[0]?.explanation).toEqual({
        key: 'caesar.steps.encrypt',
        params: {
          letter: 'B',
          inputIndex: 1,
          shift: 3,
          outputIndex: 4,
          outputLetter: 'E',
        },
      });

      const decResult = getSteps('E', { shift: 29 }, 'decrypt');
      expect(decResult.steps[0]?.explanation).toEqual({
        key: 'caesar.steps.decrypt',
        params: {
          letter: 'E',
          inputIndex: 4,
          shift: 3,
          outputIndex: 1,
          outputLetter: 'B',
        },
      });
    });

    it('conserve les positions réelles des lettres dans le texte original', () => {
      const text = ' 12a!B ';
      // 'a' est à l'index 3, 'B' est à l'index 5
      const result = getSteps(text, { shift: 1 }, 'encrypt');

      expect(result.steps).toHaveLength(2);
      expect(result.steps[0]?.data.position).toBe(3);
      expect(result.steps[0]?.input).toBe('a');
      expect(result.steps[0]?.output).toBe('b');
      expect(result.steps[0]?.data.isUpper).toBe(false);

      expect(result.steps[1]?.data.position).toBe(5);
      expect(result.steps[1]?.input).toBe('B');
      expect(result.steps[1]?.output).toBe('C');
      expect(result.steps[1]?.data.isUpper).toBe(true);

      expect(result.output).toBe(' 12b!C ');
    });

    it('gère une chaîne sans aucune lettre alphabétique', () => {
      const text = '12345 !?#';
      const result = getSteps(text, { shift: 5 }, 'encrypt');
      expect(result.input).toBe(text);
      expect(result.output).toBe(text);
      expect(result.steps).toEqual([]);
    });
  });
});
