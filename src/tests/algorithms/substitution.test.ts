import { describe, expect, it } from 'vitest';
import {
  buildAlphabetFromKeyword,
  getMappingTable,
  invertAlphabet,
  substitutionAlgorithm,
} from '@/algorithms/substitution';
import { decrypt, encrypt, getSteps, validate } from '@/algorithms/substitution/substitution';

describe('Substitution cipher - alphabet generation, encrypt, decrypt, validation', () => {
  describe('buildAlphabetFromKeyword', () => {
    it('génère l’alphabet attendu pour le mot-clé SECURITE', () => {
      const alphabet = buildAlphabetFromKeyword('SECURITE');
      expect(alphabet).toBe('SECURITABDFGHJKLMNOPQVWXYZ');
      expect(alphabet).toHaveLength(26);
    });

    it('ignore la casse, les espaces, la ponctuation et les accents', () => {
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
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'ZYXWVUTSRQPONMLKJIHGFEDCBA',
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

  describe('getSteps', () => {
    const securiteAlphabet = buildAlphabetFromKeyword('SECURITE');

    it('lève une exception si les paramètres sont invalides', () => {
      expect(() => getSteps('test', { alphabet: 'INVALIDE' }, 'encrypt')).toThrowError();
      expect(() => getSteps('test', { alphabet: 'INVALIDE' }, 'decrypt')).toThrowError();
    });

    it('retourne un output identique à encrypt en mode encrypt et decrypt en mode decrypt', () => {
      const text = 'Hello, World! 123';
      const params = { alphabet: securiteAlphabet };

      const encResult = getSteps(text, params, 'encrypt');
      expect(encResult.output).toBe(encrypt(text, params));
      expect(encResult.input).toBe(text);

      const decResult = getSteps(encResult.output, params, 'decrypt');
      expect(decResult.output).toBe(decrypt(encResult.output, params));
      expect(decResult.output).toBe(text);
      expect(decResult.input).toBe(encResult.output);
    });

    it('génère un nombre d’étapes exactement égal au nombre de lettres ASCII', () => {
      const text = 'A1 b2 C3!'; // 3 lettres : A, b, C
      const result = getSteps(text, { alphabet: securiteAlphabet }, 'encrypt');

      expect(result.steps).toHaveLength(3);
      expect(result.output).toBe('S1 e2 C3!');
    });

    it('produit des index d’étape consécutifs depuis 0', () => {
      const text = 'CRYPTOLAB';
      const result = getSteps(text, { alphabet: securiteAlphabet }, 'encrypt');

      expect(result.steps).toHaveLength(9);
      result.steps.forEach((step, idx) => {
        expect(step.index).toBe(idx);
      });
    });

    it('identifie correctement les points fixes (isFixedPoint)', () => {
      // Dans SECURITABDFGHJKLMNOPQVWXYZ :
      // Y est à l'index 24 de l'alphabet standard, et alphabet[24] = 'Y' (point fixe !)
      // Z est à l'index 25, alphabet[25] = 'Z' (point fixe !)
      // C est à l'index 2, alphabet[2] = 'C' (point fixe !)
      // A est à l'index 0, alphabet[0] = 'S' (pas un point fixe)
      const result = getSteps('YZA', { alphabet: securiteAlphabet }, 'encrypt');

      expect(result.steps[0]?.input).toBe('Y');
      expect(result.steps[0]?.data.plainLetter).toBe('Y');
      expect(result.steps[0]?.data.cipherLetter).toBe('Y');
      expect(result.steps[0]?.data.isFixedPoint).toBe(true);

      expect(result.steps[1]?.input).toBe('Z');
      expect(result.steps[1]?.data.isFixedPoint).toBe(true);

      expect(result.steps[2]?.input).toBe('A');
      expect(result.steps[2]?.data.isFixedPoint).toBe(false);
    });

    it('fournit les données cohérentes en mode déchiffrement', () => {
      // Déchiffrement de 'S' avec SECURITE donne 'A'
      const result = getSteps('S', { alphabet: securiteAlphabet }, 'decrypt');

      expect(result.steps).toHaveLength(1);
      const step = result.steps[0]!;
      expect(step.input).toBe('S');
      expect(step.output).toBe('A');
      expect(step.calculation).toBe('S → A');
      expect(step.data.plainLetter).toBe('A');
      expect(step.data.cipherLetter).toBe('S');
      expect(step.data.plainIndex).toBe(0);
      expect(step.data.cipherIndex).toBe(18); // 'S' est index 18 dans l'alphabet de base
      expect(step.key).toBe(securiteAlphabet);
      expect(step.explanation).toEqual({
        key: 'substitution.steps.decrypt',
        params: {
          letter: 'S',
          outputLetter: 'A',
          plainIndex: 0,
        },
      });
    });

    it('fournit le calcul "A → S" et l’explication en mode chiffrement', () => {
      const result = getSteps('a', { alphabet: securiteAlphabet }, 'encrypt');
      const step = result.steps[0]!;

      expect(step.input).toBe('a');
      expect(step.output).toBe('s');
      expect(step.calculation).toBe('A → S');
      expect(step.data.plainLetter).toBe('A');
      expect(step.data.cipherLetter).toBe('S');
      expect(step.data.plainIndex).toBe(0);
      expect(step.data.cipherIndex).toBe(18);
      expect(step.data.isUpper).toBe(false);
      expect(step.explanation).toEqual({
        key: 'substitution.steps.encrypt',
        params: {
          letter: 'a',
          outputLetter: 's',
          plainIndex: 0,
        },
      });
    });
  });
});
