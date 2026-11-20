import { describe, expect, it } from 'vitest';
import {
  buildAlphabetFromKeyword,
  caesarAlgorithm,
  getPaddingLength,
  permutationAlgorithm,
  substitutionAlgorithm,
  vigenereAlgorithm,
} from '@/algorithms';
import type { AlgorithmResult, CipherAlgorithm, ValidationResult } from '@/types';
import { normalizeLetters } from '@/utils/text';

interface ContractCase {
  id: string;
  validate: (isValid: boolean) => ValidationResult;
  encryptInvalid: () => string;
  runCycle: (text: string) => {
    expected: string;
    enc: string;
    dec: string;
    encSteps: AlgorithmResult<unknown>;
    decSteps: AlgorithmResult<unknown>;
  };
}

function createContractCase<P, S>(
  id: string,
  algo: CipherAlgorithm<P, S>,
  validParams: P,
  invalidParams: P,
  getExpectedPlain: (input: string) => string,
  getDecryptParams: (input: string) => P,
): ContractCase {
  return {
    id,
    validate: (isValid) => algo.validate(isValid ? validParams : invalidParams),
    encryptInvalid: () => algo.encrypt('TEST', invalidParams),
    runCycle: (text: string) => {
      const expected = getExpectedPlain(text);
      const enc = algo.encrypt(text, validParams);
      const decParams = getDecryptParams(text);
      const dec = algo.decrypt(enc, decParams);
      const encSteps = algo.getSteps(text, validParams, 'encrypt');
      const decSteps = algo.getSteps(enc, decParams, 'decrypt');
      return { expected, enc, dec, encSteps, decSteps };
    },
  };
}

const contractCases: ContractCase[] = [
  createContractCase(
    'caesar',
    caesarAlgorithm,
    { shift: 3 },
    { shift: 1.5 },
    (input) => input,
    () => ({ shift: 3 }),
  ),
  createContractCase(
    'substitution',
    substitutionAlgorithm,
    { alphabet: buildAlphabetFromKeyword('CRYPTOGRAPHIE') },
    { alphabet: 'INVALIDE' },
    (input) => input,
    () => ({ alphabet: buildAlphabetFromKeyword('CRYPTOGRAPHIE') }),
  ),
  createContractCase(
    'permutation',
    permutationAlgorithm,
    { permutation: [2, 4, 1, 3] },
    { permutation: [1, 1] },
    (input) => normalizeLetters(input),
    (input) => {
      const normalizedLength = normalizeLetters(input).length;
      return {
        permutation: [2, 4, 1, 3],
        paddingLength: getPaddingLength(normalizedLength, 4),
      };
    },
  ),
  createContractCase(
    'vigenere',
    vigenereAlgorithm,
    { key: 'CLE' },
    { key: '' },
    (input) => input,
    () => ({ key: 'CLE' }),
  ),
];

const testTexts = [
  { desc: 'texte vide', text: '' },
  { desc: 'lettre unique', text: 'A' },
  {
    desc: 'texte avec espaces et ponctuation',
    text: 'Hello, World! Classical cryptography in 2026.',
  },
  { desc: 'texte avec accents', text: 'Élève ingénieur très appliqué, où ça ?' },
  {
    desc: 'texte d’au moins 100 lettres',
    text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris',
  },
];

describe.each(contractCases)(
  'Contrat CipherAlgorithm pour "$id"',
  ({ id, validate, encryptInvalid, runCycle }) => {
    it('valide avec succès les paramètres valides', () => {
      const result = validate(true);
      expect(result.valid).toBe(true);
    });

    it('rejette les paramètres invalides avec au moins une erreur', () => {
      const result = validate(false);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('lève une exception Error lors d’un encrypt avec des paramètres invalides', () => {
      expect(() => encryptInvalid()).toThrow(Error);
    });

    describe('propriété de réversibilité et cohérence des étapes', () => {
      it.each(testTexts)('vérifie decrypt(encrypt(x)) et getSteps sur $desc', ({ text }) => {
        const { expected, enc, dec, encSteps, decSteps } = runCycle(text);

        expect(dec).toBe(expected);

        // getSteps en chiffrement
        expect(encSteps.output).toBe(enc);
        expect(encSteps.input).toBe(text);
        encSteps.steps.forEach((step, index) => {
          expect(step.index).toBe(index);
          expect(step.explanation.key.startsWith(id)).toBe(true);
        });

        // getSteps en déchiffrement
        expect(decSteps.output).toBe(dec);
        expect(decSteps.input).toBe(enc);
        decSteps.steps.forEach((step, index) => {
          expect(step.index).toBe(index);
          expect(step.explanation.key.startsWith(id)).toBe(true);
        });
      });
    });
  },
);
