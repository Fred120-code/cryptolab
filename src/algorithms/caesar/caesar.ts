import type {
  AlgorithmResult,
  CipherAlgorithm,
  ExecutionStep,
  OperationMode,
  ValidationResult,
} from '@/types';
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
 * Vérifie que les paramètres de César sont valides et lève une exception dans le cas contraire.
 *
 * @param params Paramètres de César à contrôler.
 * @throws {Error} Si le décalage n'est pas un entier sûr.
 */
function assertValid(params: CaesarParams): void {
  const validation = validate(params);
  if (!validation.valid) {
    throw new Error('Paramètres de César invalides : le décalage doit être un entier fini.');
  }
}

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
 * La clé doit obligatoirement être un entier sûr (Number.isSafeInteger).
 * Les valeurs non numériques, flottants non entiers, NaN, Infinity, -Infinity
 * ainsi que les entiers hors de l'intervalle sûr ([-2^53 + 1, 2^53 - 1]) sont rejetés.
 *
 * @param params Paramètres de César à contrôler.
 * @returns Un objet ValidationResult conforme.
 */
export function validate(params: CaesarParams): ValidationResult {
  const { shift } = params;

  if (typeof shift !== 'number' || !Number.isSafeInteger(shift)) {
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
  assertValid(params);

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
  assertValid(params);

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
 * Seules les lettres ASCII produisent une étape d'exécution (ExecutionStep).
 * Les caractères non alphabétiques et les lettres accentuées (É, ç...) ne sont
 * pas transformés et ne produisent pas d'étape, mais restent intacts dans `output`.
 *
 * @param text Texte source à traiter.
 * @param params Paramètres contenant la clé de décalage.
 * @param mode Mode d'opération ('encrypt' ou 'decrypt').
 * @returns Un objet AlgorithmResult contenant l'entrée, la sortie complète et chaque étape unitaire.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function getSteps(
  text: string,
  params: CaesarParams,
  mode: OperationMode,
): AlgorithmResult<CaesarStepData> {
  assertValid(params);

  const normalized = normalizeShift(params.shift);
  const steps: ExecutionStep<CaesarStepData>[] = [];
  let output = '';
  let stepIndex = 0;

  for (let position = 0; position < text.length; position++) {
    const char = text[position]!;

    if (!isLetter(char)) {
      output += char;
      continue;
    }

    const upper = isUpperLetter(char);
    const inputIndex = letterToIndex(char);

    let outputIndex: number;
    let calculation: string;
    let wrapped: boolean;

    if (mode === 'encrypt') {
      outputIndex = mod(inputIndex + normalized, ALPHABET_SIZE);
      calculation = `(${inputIndex} + ${normalized}) mod ${ALPHABET_SIZE} = ${outputIndex}`;
      wrapped = inputIndex + normalized >= ALPHABET_SIZE;
    } else {
      outputIndex = mod(inputIndex - normalized, ALPHABET_SIZE);
      calculation = `(${inputIndex} - ${normalized}) mod ${ALPHABET_SIZE} = ${outputIndex}`;
      wrapped = inputIndex - normalized < 0;
    }

    const outChar = indexToLetter(outputIndex, upper);
    output += outChar;

    const explanationKey = mode === 'encrypt' ? 'caesar.steps.encrypt' : 'caesar.steps.decrypt';

    steps.push({
      index: stepIndex++,
      input: char,
      key: normalized,
      calculation,
      output: outChar,
      explanation: {
        key: explanationKey,
        params: {
          letter: char,
          inputIndex,
          shift: normalized,
          outputIndex,
          outputLetter: outChar,
        },
      },
      data: {
        position,
        inputIndex,
        outputIndex,
        shift: normalized,
        rawShift: params.shift,
        wrapped,
        isUpper: upper,
      },
    });
  }

  return {
    input: text,
    output,
    steps,
  };
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
