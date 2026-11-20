import { describe, expect, it } from 'vitest';
import {
  alignKey,
  decrypt,
  encrypt,
  getSteps,
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

  describe('getSteps', () => {
    it('calcule les étapes en chiffrement pour "BONJOUR" avec clé "CLE"', () => {
      const res = getSteps('BONJOUR', { key: 'CLE' }, 'encrypt');
      expect(res.input).toBe('BONJOUR');
      expect(res.output).toBe('DZRLZYT');
      expect(res.steps).toHaveLength(7);

      // Première étape : B + C => D
      const step0 = res.steps[0]!;
      expect(step0).toEqual({
        index: 0,
        input: 'B',
        key: 'C',
        calculation: '(1 + 2) mod 26 = 3',
        output: 'D',
        explanation: {
          key: 'vigenere.steps.encrypt',
          params: {
            letter: 'B',
            letterValue: 1,
            keyLetter: 'C',
            keyValue: 2,
            rawResult: 3,
            outputValue: 3,
            outputLetter: 'D',
          },
        },
        data: {
          position: 0,
          letterIndex: 0,
          keyIndex: 0,
          keyLetter: 'C',
          inputValue: 1,
          keyValue: 2,
          rawResult: 3,
          outputValue: 3,
          wrapped: false,
          isUpper: true,
        },
      });

      // Étape 5 (U + E = 20 + 4 = 24 => Y, sans wrap)
      const step5 = res.steps[5]!;
      expect(step5.data.wrapped).toBe(false);
      expect(step5.output).toBe('Y');
    });

    it('détecte le wrap en chiffrement quand rawResult >= 26', () => {
      const res = getSteps('Z', { key: 'B' }, 'encrypt'); // 25 + 1 = 26 => 0 ('A')
      expect(res.steps).toHaveLength(1);
      const step = res.steps[0]!;
      expect(step.data.rawResult).toBe(26);
      expect(step.data.outputValue).toBe(0);
      expect(step.data.wrapped).toBe(true);
      expect(step.output).toBe('A');
    });

    it('calcule les étapes en déchiffrement et détecte le wrap quand rawResult < 0', () => {
      const res = getSteps('A', { key: 'B' }, 'decrypt'); // 0 - 1 = -1 => 25 ('Z')
      expect(res.steps).toHaveLength(1);
      const step = res.steps[0]!;
      expect(step.data.rawResult).toBe(-1);
      expect(step.data.outputValue).toBe(25);
      expect(step.data.wrapped).toBe(true);
      expect(step.output).toBe('Z');
      expect(step.calculation).toBe('(0 - 1) mod 26 = 25');
      expect(step.explanation.key).toBe('vigenere.steps.decrypt');
    });

    it('traite correctement un texte avec ponctuation et espaces', () => {
      const res = getSteps('Hello, World!', { key: 'KEY' }, 'encrypt');
      // 10 lettres dans "Hello, World!"
      expect(res.steps).toHaveLength(10);
      expect(res.output).toBe('Rijvs, Uyvjn!');

      // Vérifie la lettre 'W' à la position 7
      const wStep = res.steps[5]!;
      expect(wStep.input).toBe('W');
      expect(wStep.data.position).toBe(7);
      expect(wStep.data.letterIndex).toBe(5);
      expect(wStep.data.keyIndex).toBe(2); // 5 % 3 = 2 ('Y')
      expect(wStep.data.keyLetter).toBe('Y');
    });

    it('gère une chaîne vide ou sans lettres', () => {
      const empty = getSteps('', { key: 'CLE' }, 'encrypt');
      expect(empty.steps).toHaveLength(0);
      expect(empty.output).toBe('');

      const nonLetters = getSteps('123 !?,.-', { key: 'CLE' }, 'encrypt');
      expect(nonLetters.steps).toHaveLength(0);
      expect(nonLetters.output).toBe('123 !?,.-');
    });

    it('est parfaitement cohérent avec encrypt et decrypt sur n’importe quel texte', () => {
      const sample = 'Le chiffre de Vigenère est polyalphabétique ! 123';
      const encSteps = getSteps(sample, { key: 'CRYPTO' }, 'encrypt');
      expect(encSteps.output).toBe(encrypt(sample, { key: 'CRYPTO' }));

      const decSteps = getSteps(encSteps.output, { key: 'CRYPTO' }, 'decrypt');
      expect(decSteps.output).toBe(decrypt(encSteps.output, { key: 'CRYPTO' }));
      expect(decSteps.output).toBe(sample);
    });
  });

  describe('vigenereAlgorithm instance', () => {
    it('implémente CipherAlgorithm avec id "vigenere"', () => {
      expect(vigenereAlgorithm.id).toBe('vigenere');
      expect(vigenereAlgorithm.validate({ key: 'CLE' }).valid).toBe(true);
      expect(vigenereAlgorithm.encrypt('BONJOUR', { key: 'CLE' })).toBe('DZRLZYT');
      expect(vigenereAlgorithm.decrypt('DZRLZYT', { key: 'CLE' })).toBe('BONJOUR');

      const stepsResult = vigenereAlgorithm.getSteps('BONJOUR', { key: 'CLE' }, 'encrypt');
      expect(stepsResult.output).toBe('DZRLZYT');
      expect(stepsResult.steps).toHaveLength(7);
    });
  });
});
