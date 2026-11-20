import { describe, expect, it } from 'vitest';
import {
  alignKey,
  decrypt,
  encrypt,
  normalizeKey,
  validate,
  vigenereAlgorithm,
} from '@/algorithms/vigenere/vigenere';

describe('Vigenère cipher - encrypt, decrypt and validation', () => {
  describe('normalizeKey', () => {
    it('convertit la clé en majuscules', () => {
      expect(normalizeKey('cle')).toBe('CLE');
      expect(normalizeKey('Secret')).toBe('SECRET');
    });
  });

  describe('validate', () => {
    it('rejette les clés vides ou composées d’espaces', () => {
      expect(validate({ key: '' })).toEqual({
        valid: false,
        errors: [{ key: 'vigenere.errors.emptyKey' }],
      });
      expect(validate({ key: '   ' })).toEqual({
        valid: false,
        errors: [{ key: 'vigenere.errors.emptyKey' }],
      });
      expect(validate({ key: null as unknown as string })).toEqual({
        valid: false,
        errors: [{ key: 'vigenere.errors.emptyKey' }],
      });
    });

    it('rejette les caractères non alphabétiques ASCII dans la clé et retourne les caractères uniques', () => {
      const result = validate({ key: 'CLE 1é!' });
      expect(result).toEqual({
        valid: false,
        errors: [
          {
            key: 'vigenere.errors.invalidKeyCharacters',
            params: { characters: ' 1é!' },
          },
        ],
      });
    });

    it('dédoublonne les caractères invalides dans lordre de première apparition', () => {
      const result = validate({ key: 'A1B2A1--' });
      expect(result).toEqual({
        valid: false,
        errors: [
          {
            key: 'vigenere.errors.invalidKeyCharacters',
            params: { characters: '12-' },
          },
        ],
      });
    });

    it('accepte les clés valides en minuscules, majuscules ou mixtes', () => {
      expect(validate({ key: 'cle' })).toEqual({ valid: true });
      expect(validate({ key: 'CLE' })).toEqual({ valid: true });
      expect(validate({ key: 'ClefSecrete' })).toEqual({ valid: true });
    });
  });

  describe('alignKey', () => {
    it('gère une chaîne vide', () => {
      expect(alignKey('', 'CLE')).toBe('');
    });

    it('aligne la clé sur les lettres et met un espace pour les non-lettres sans consommer la clé', () => {
      expect(alignKey('BON JOUR', 'CLE')).toBe('CLE CLEC');
      expect(alignKey("L'arbre", 'PI')).toBe('P IPIPI');
      expect(alignKey('Hello, World!', 'KEY')).toBe('KEYKE  YKEYK ');
    });

    it('préserve strictement la longueur de la chaîne d’origine', () => {
      const text = 'Crypto-Lab 2026, version 1.0 !';
      const aligned = alignKey(text, 'SECRET');
      expect(aligned.length).toBe(text.length);
    });

    it('lève une erreur si la clé est invalide', () => {
      expect(() => alignKey('BONJOUR', '')).toThrow('Paramètres de Vigenère invalides.');
      expect(() => alignKey('BONJOUR', 'CLE123')).toThrow('Paramètres de Vigenère invalides.');
    });
  });

  describe('encrypt et decrypt', () => {
    it('chiffre "BONJOUR" avec la clé "CLE" => "DZRLZYT"', () => {
      expect(encrypt('BONJOUR', { key: 'CLE' })).toBe('DZRLZYT');
      expect(decrypt('DZRLZYT', { key: 'CLE' })).toBe('BONJOUR');
    });

    it('chiffre "SECURITE" avec la clé "INFO" => "ARHIZVYS"', () => {
      expect(encrypt('SECURITE', { key: 'INFO' })).toBe('ARHIZVYS');
      expect(decrypt('ARHIZVYS', { key: 'INFO' })).toBe('SECURITE');
    });

    it('préserve la casse d’origine', () => {
      expect(encrypt('BonJour!', { key: 'CLE' })).toBe('DzrLzyt!');
      expect(decrypt('DzrLzyt!', { key: 'CLE' })).toBe('BonJour!');
    });

    it('ne modifie pas les caractères non alphabétiques ASCII et ne consomme pas la clé', () => {
      const plain = 'HELLO, WORLD!';
      const cipher = encrypt(plain, { key: 'KEY' });
      expect(cipher).toBe('RIJVS, UYVJN!');
      expect(decrypt(cipher, { key: 'KEY' })).toBe(plain);
    });

    it('gère la chaîne vide', () => {
      expect(encrypt('', { key: 'CLE' })).toBe('');
      expect(decrypt('', { key: 'CLE' })).toBe('');
    });

    it('est insensible à la casse de la clé', () => {
      expect(encrypt('BONJOUR', { key: 'cle' })).toBe('DZRLZYT');
      expect(decrypt('DZRLZYT', { key: 'cle' })).toBe('BONJOUR');
    });

    it('déchiffre parfaitement après chiffrement sur des textes variés', () => {
      const samples = [
        'Attaque a laube!',
        'Ceci est un test complexe avec des accents: été, naïve, où ?',
        'Z',
        '1234567890 !? :;.',
      ];
      for (const sample of samples) {
        const encrypted = encrypt(sample, { key: 'SECRETKEY' });
        expect(decrypt(encrypted, { key: 'SECRETKEY' })).toBe(sample);
      }
    });

    it('lève une exception si les paramètres sont invalides', () => {
      expect(() => encrypt('TEST', { key: '' })).toThrow('Paramètres de Vigenère invalides.');
      expect(() => decrypt('TEST', { key: '123' })).toThrow('Paramètres de Vigenère invalides.');
    });
  });

  describe('vigenereAlgorithm instance', () => {
    it('implémente CipherAlgorithm avec id "vigenere"', () => {
      expect(vigenereAlgorithm.id).toBe('vigenere');
      expect(vigenereAlgorithm.validate({ key: 'CLE' }).valid).toBe(true);
      expect(vigenereAlgorithm.encrypt('BONJOUR', { key: 'CLE' })).toBe('DZRLZYT');
      expect(vigenereAlgorithm.decrypt('DZRLZYT', { key: 'CLE' })).toBe('BONJOUR');
      expect(() => vigenereAlgorithm.getSteps('A', { key: 'B' }, 'encrypt')).toThrow(
        'not implemented',
      );
    });
  });
});
