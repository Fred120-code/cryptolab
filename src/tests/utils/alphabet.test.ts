import { describe, expect, it } from 'vitest';
import {
  ALPHABET_SIZE,
  indexToLetter,
  isLetter,
  isLowerLetter,
  isUpperLetter,
  letterToIndex,
  mod,
} from '@/utils/alphabet';

describe('alphabet utils', () => {
  describe('ALPHABET_SIZE', () => {
    it('est égal à 26', () => {
      expect(ALPHABET_SIZE).toBe(26);
    });
  });

  describe('mod', () => {
    it('calcule correctement pour des nombres positifs', () => {
      expect(mod(3, 26)).toBe(3);
      expect(mod(26, 26)).toBe(0);
      expect(mod(29, 26)).toBe(3);
      expect(mod(52, 26)).toBe(0);
    });

    it('calcule correctement pour des nombres négatifs', () => {
      expect(mod(-3, 26)).toBe(23);
      expect(mod(-26, 26)).toBe(0);
      expect(mod(-29, 26)).toBe(23);
      expect(mod(-52, 26)).toBe(0);
    });

    it('gère le zéro', () => {
      expect(mod(0, 26)).toBe(0);
    });
  });

  describe('isUpperLetter', () => {
    it('détecte les majuscules A-Z', () => {
      expect(isUpperLetter('A')).toBe(true);
      expect(isUpperLetter('M')).toBe(true);
      expect(isUpperLetter('Z')).toBe(true);
    });

    it('rejette les minuscules et caractères non-ASCII', () => {
      expect(isUpperLetter('a')).toBe(false);
      expect(isUpperLetter('z')).toBe(false);
      expect(isUpperLetter('É')).toBe(false);
      expect(isUpperLetter('1')).toBe(false);
      expect(isUpperLetter(' ')).toBe(false);
      expect(isUpperLetter('')).toBe(false);
      expect(isUpperLetter('AB')).toBe(false);
    });
  });

  describe('isLowerLetter', () => {
    it('détecte les minuscules a-z', () => {
      expect(isLowerLetter('a')).toBe(true);
      expect(isLowerLetter('m')).toBe(true);
      expect(isLowerLetter('z')).toBe(true);
    });

    it('rejette les majuscules et caractères non-ASCII', () => {
      expect(isLowerLetter('A')).toBe(false);
      expect(isLowerLetter('Z')).toBe(false);
      expect(isLowerLetter('é')).toBe(false);
      expect(isLowerLetter('3')).toBe(false);
      expect(isLowerLetter('.')).toBe(false);
      expect(isLowerLetter('')).toBe(false);
    });
  });

  describe('isLetter', () => {
    it('valide toutes les lettres ASCII', () => {
      expect(isLetter('A')).toBe(true);
      expect(isLetter('z')).toBe(true);
    });

    it('rejette la ponctuation, chiffres, accents et espaces', () => {
      expect(isLetter(' ')).toBe(false);
      expect(isLetter('!')).toBe(false);
      expect(isLetter('7')).toBe(false);
      expect(isLetter('à')).toBe(false);
      expect(isLetter('Ç')).toBe(false);
    });
  });

  describe('letterToIndex', () => {
    it("convertit les majuscules d'après leur rang (0-25)", () => {
      expect(letterToIndex('A')).toBe(0);
      expect(letterToIndex('B')).toBe(1);
      expect(letterToIndex('Z')).toBe(25);
    });

    it("convertit les minuscules d'après leur rang (0-25)", () => {
      expect(letterToIndex('a')).toBe(0);
      expect(letterToIndex('b')).toBe(1);
      expect(letterToIndex('z')).toBe(25);
    });

    it('lève une erreur pour les caractères non alphabétiques', () => {
      expect(() => letterToIndex(' ')).toThrowError();
      expect(() => letterToIndex('1')).toThrowError();
      expect(() => letterToIndex('é')).toThrowError();
    });
  });

  describe('indexToLetter', () => {
    it('convertit les index en majuscules', () => {
      expect(indexToLetter(0, true)).toBe('A');
      expect(indexToLetter(25, true)).toBe('Z');
      expect(indexToLetter(26, true)).toBe('A');
      expect(indexToLetter(-1, true)).toBe('Z');
    });

    it('convertit les index en minuscules', () => {
      expect(indexToLetter(0, false)).toBe('a');
      expect(indexToLetter(25, false)).toBe('z');
      expect(indexToLetter(26, false)).toBe('a');
      expect(indexToLetter(-1, false)).toBe('z');
    });
  });
});
