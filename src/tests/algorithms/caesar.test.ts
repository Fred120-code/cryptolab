import { describe, expect, it } from 'vitest';
import { caesarAlgorithm, decrypt, encrypt, normalizeShift, validate } from '@/algorithms/caesar';

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
      // L(11) + 5 = Q(16), é inchangé, t(19) + 5 = y(24), é inchangé...
      // i(8) + 5 = n(13)
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
});
