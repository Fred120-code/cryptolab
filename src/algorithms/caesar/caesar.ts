import type { AlgorithmResult, CipherAlgorithm, OperationMode, ValidationResult } from '@/types';
import {
  ALPHABET_SIZE,
  indexToLetter,
  isLetter,
  isUpperLetter,
  letterToIndex,
  mod,
} from '@/utils/alphabet';
import type { CaesarParams, CaesarStepData } from './types';

/**
 * Normalise un décalage quelconque pour le ramener dans l'intervalle [0, 25].
 *
 * @param k Clé de décalage entière.
 * @returns La clé normalisée entre 0 et 25.
 * @example
 * normalizeShift(29) // 3
 * normalizeShift(-3) // 23
 */
export function normalizeShift(k: number): number {
  return mod(k, ALPHABET_SIZE);
}

/**
 * Valide les paramètres fournis pour le chiffrement de César.
 *
 * La clé doit obligatoirement être un entier fini (les flottants non entiers,
 * NaN, Infinity et -Infinity sont rejetés).
 *
 * @param params Paramètres de César à contrôler.
 * @returns Un objet ValidationResult conforme.
 */
export function validate(params: CaesarParams): ValidationResult {
  const { shift } = params;

  if (typeof shift !== 'number' || !Number.isFinite(shift) || !Number.isInteger(shift)) {
    return {
      valid: false,
      errors: [
        {
          key: 'caesar.errors.shiftNotInteger',
          params: { value: String(shift) },
        },
      ],
    };
  }

  return { valid: true };
}

/**
 * Chiffre un texte avec le chiffrement de César : C = (P + k) mod 26.
 *
 * Seules les lettres ASCII sont décalées, en préservant la casse.
 * Les autres caractères restent inchangés.
 *
 * @param text Texte à chiffrer.
 * @param params Paramètres contenant la clé de décalage.
 * @returns Le texte chiffré.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function encrypt(text: string, params: CaesarParams): string {
  const validation = validate(params);
  if (!validation.valid) {
    throw new Error('Paramètres de César invalides : le décalage doit être un entier fini.');
  }

  const k = normalizeShift(params.shift);
  let result = '';

  for (const char of text) {
    if (isLetter(char)) {
      const upper = isUpperLetter(char);
      const p = letterToIndex(char);
      const c = mod(p + k, ALPHABET_SIZE);
      result += indexToLetter(c, upper);
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Déchiffre un texte chiffré avec César : P = (C - k) mod 26.
 *
 * Seules les lettres ASCII sont décalées, en préservant la casse.
 * Les autres caractères restent inchangés.
 *
 * @param text Texte chiffré à déchiffrer.
 * @param params Paramètres contenant la clé de décalage.
 * @returns Le texte déchiffré en clair.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function decrypt(text: string, params: CaesarParams): string {
  const validation = validate(params);
  if (!validation.valid) {
    throw new Error('Paramètres de César invalides : le décalage doit être un entier fini.');
  }

  const k = normalizeShift(params.shift);
  let result = '';

  for (const char of text) {
    if (isLetter(char)) {
      const upper = isUpperLetter(char);
      const c = letterToIndex(char);
      const p = mod(c - k, ALPHABET_SIZE);
      result += indexToLetter(p, upper);
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Calcule l'ensemble des étapes d'exécution détaillées pour chaque lettre du texte.
 *
 * @param text Texte source à traiter.
 * @param params Paramètres avec clé de décalage.
 * @param mode Mode d'opération ('encrypt' ou 'decrypt').
 * @returns Un objet AlgorithmResult contenant la sortie complète et chaque étape unitaire.
 */
export function getSteps(
  _text: string,
  _params: CaesarParams,
  _mode: OperationMode,
): AlgorithmResult<CaesarStepData> {
  throw new Error('Not implemented yet');
}

/**
 * Instance CipherAlgorithm pour le chiffrement de César.
 */
export const caesarAlgorithm: CipherAlgorithm<CaesarParams, CaesarStepData> = {
  id: 'caesar',
  validate,
  encrypt,
  decrypt,
  getSteps,
};
