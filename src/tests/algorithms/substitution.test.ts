import { describe, expect, it } from 'vitest';
import {
  buildAlphabetFromKeyword,
  getMappingTable,
  invertAlphabet,
  substitutionAlgorithm,
} from '@/algorithms/substitution';
import { decrypt, encrypt, validate } from '@/algorithms/substitution/substitution';

describe('Substitution cipher - alphabet generation, encrypt, decrypt, validation', () => {
  describe('buildAlphabetFromKeyword', () => {
    it('génère l’alphabet attendu pour le mot-clé SECURITE', () => {
      const alphabet = buildAlphabetFromKeyword('SECURITE');
      expect(alphabet).toBe('SECURITABDFGHJKLMNOPQVWXYZ');
      expect(alphabet).toHaveLength(26);
    });

    it('ignore la casse, les espaces, la ponctuation et les accents', () => {
      // "sécurité !" -> lettres ASCII S, E, C, U, R, I, T (é non ASCII)
      const alphabet = buildAlphabetFromKeyword('se curite');
      expect(alphabet).toBe('SECURITABDFGHJKLMNOPQVWXYZ');
    });

    it('retourne l’alphabet normal pour un mot-clé vide ou sans lettre ASCII', () => {
      expect(buildAlphabetFromKeyword('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(buildAlphabetFromKeyword('12345 !? #éàç')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('gère un mot-clé contenant déjà les 26 lettres sans doublon', () => {
      const full = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';
      expect(buildAlphabetFromKeyword(full)).toBe(full);
    });
  });

  describe('validate', () => {
    it('accepte un alphabet valide en majuscules ou minuscules', () => {
      expect(validate({ alphabet: 'SECURITABDFGHJKLMNOPQVWXYZ' })).toEqual({ valid: true });
      expect(validate({ alphabet: 'securitabdfghjklmnopqvwxyz' })).toEqual({ valid: true });
      expect(validate({ alphabet: 'ZYXWVUTSRQPONMLKJIHGFEDCBA' })).toEqual({ valid: true });
    });

    it('rejette une longueur invalide (25 ou 27)', () => {
      const tooShort = validate({ alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXY' });
      expect(tooShort.valid).toBe(false);
      if (!tooShort.valid) {
        expect(tooShort.errors.some((e) => e.key === 'substitution.errors.invalidLength')).toBe(
          true,
        );
      }

      const tooLong = validate({ alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZA' });
      expect(tooLong.valid).toBe(false);
      if (!tooLong.valid) {
        expect(tooLong.errors.some((e) => e.key === 'substitution.errors.invalidLength')).toBe(
          true,
        );
      }
    });

    it('rejette les caractères non alphabétiques ASCII', () => {
      const withNonLetters = validate({ alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXY1' });
      expect(withNonLetters.valid).toBe(false);
      if (!withNonLetters.valid) {
        const err = withNonLetters.errors.find(
          (e) => e.key === 'substitution.errors.invalidCharacters',
        );
        expect(err).toBeDefined();
        expect(err?.params?.['characters']).toBe('1');
      }
    });

    it('rejette les doublons de lettres (insensible à la casse)', () => {
      const withDuplicates = validate({ alphabet: 'BBCDEFGHIJKLMNOPQRSTUVWXYZA' });
      expect(withDuplicates.valid).toBe(false);
      if (!withDuplicates.valid) {
        const err = withDuplicates.errors.find(
          (e) => e.key === 'substitution.errors.duplicateLetters',
        );
        expect(err).toBeDefined();
      }
    });

    it('cumule plusieurs erreurs applicables simultanément', () => {
      // Longueur 27 (invalidLength), contient '1' et '?' (invalidCharacters), et répète 'A' (duplicateLetters)
      const badAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1?A';
      const result = validate({ alphabet: badAlphabet });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        const keys = result.errors.map((e) => e.key);
        expect(keys).toContain('substitution.errors.invalidLength');
        expect(keys).toContain('substitution.errors.invalidCharacters');
        expect(keys).toContain('substitution.errors.duplicateLetters');
      }
    });
  });

  describe('invertAlphabet et getMappingTable', () => {
    it('calcule correctement l’alphabet inverse', () => {
      const alphabet = 'SECURITABDFGHJKLMNOPQVWXYZ';
      const inv = invertAlphabet(alphabet);
      expect(inv).toHaveLength(26);
      // L’inverse de l’inverse doit redonner l’alphabet initial
      expect(invertAlphabet(inv)).toBe(alphabet);
    });

    it('génère un tableau de correspondance de 26 entrées cohérentes', () => {
      const alphabet = 'SECURITABDFGHJKLMNOPQVWXYZ';
      const table = getMappingTable(alphabet);
      expect(table).toHaveLength(26);
      expect(table[0]).toEqual({ plain: 'A', cipher: 'S', index: 0 });
      expect(table[1]).toEqual({ plain: 'B', cipher: 'E', index: 1 });
      expect(table[25]).toEqual({ plain: 'Z', cipher: 'Z', index: 25 });
    });
  });

  describe('encrypt et decrypt', () => {
    const securiteAlphabet = buildAlphabetFromKeyword('SECURITE');

    it('chiffre CRYPTOGRAPHIE en CNYLPKTNSLABR avec le mot-clé SECURITE', () => {
      const plain = 'CRYPTOGRAPHIE';
      const cipher = encrypt(plain, { alphabet: securiteAlphabet });
      expect(cipher).toBe('CNYLPKTNSLABR');
      expect(decrypt('CNYLPKTNSLABR', { alphabet: securiteAlphabet })).toBe(plain);
    });

    it('préserve la casse des lettres', () => {
      const text = 'Cryptographie Classique';
      const encrypted = encrypt(text, { alphabet: securiteAlphabet });
      expect(encrypted).toBe('Cnylpktnslabr Cgsoobmqr');
      expect(decrypt(encrypted, { alphabet: securiteAlphabet })).toBe(text);
    });

    it('laisse inchangés les espaces, ponctuation, chiffres et accents', () => {
      const text = 'Été 2026 : Cryptographie & Sécurité !';
      const encrypted = encrypt(text, { alphabet: securiteAlphabet });
      expect(encrypted).toBe('Épé 2026 : Cnylpktnslabr & Oécqnbpé !');
      expect(decrypt(encrypted, { alphabet: securiteAlphabet })).toBe(text);
    });

    it('gère une chaîne vide', () => {
      expect(encrypt('', { alphabet: securiteAlphabet })).toBe('');
      expect(decrypt('', { alphabet: securiteAlphabet })).toBe('');
    });

    it('respecte decrypt(encrypt(x)) === x pour différents textes et alphabets', () => {
      const alphabets = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // Identité
        'ZYXWVUTSRQPONMLKJIHGFEDCBA', // Miroir
        securiteAlphabet,
        buildAlphabetFromKeyword('CRYPTOLAB'),
      ];

      const samples = [
        'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
        'Voyez le brick géant que j examine près du wharf 12345!',
        'ABC xyz ABC xyz',
        '',
      ];

      for (const alpha of alphabets) {
        for (const sample of samples) {
          const enc = encrypt(sample, { alphabet: alpha });
          const dec = decrypt(enc, { alphabet: alpha });
          expect(dec).toBe(sample);
        }
      }
    });

    it('lève une exception si les paramètres sont invalides', () => {
      expect(() => encrypt('test', { alphabet: 'ABC' })).toThrowError();
      expect(() => decrypt('test', { alphabet: 'ABC' })).toThrowError();
    });

    it('expose l’instance substitutionAlgorithm avec id substitution', () => {
      expect(substitutionAlgorithm.id).toBe('substitution');
      expect(substitutionAlgorithm.encrypt('A', { alphabet: securiteAlphabet })).toBe('S');
      expect(substitutionAlgorithm.decrypt('S', { alphabet: securiteAlphabet })).toBe('A');
    });
  });
});
