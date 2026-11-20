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
import type { VigenereParams, VigenereStepData } from './types';

/**
 * Normalise une clé de Vigenère en la convertissant en majuscules.
 *
 * @param key Clé sous forme de chaîne de caractères.
 * @returns La clé en majuscules.
 */
export function normalizeKey(key: string): string {
  return key.toUpperCase();
}

/**
 * Valide les paramètres du chiffrement de Vigenère.
 *
 * Règles :
 * - Clé vide (chaîne vide, ne contenant que des espaces, ou type invalide) : `vigenere.errors.emptyKey`.
 * - Caractères non alphabétiques ASCII : `vigenere.errors.invalidKeyCharacters` avec la liste des caractères uniques.
 *
 * @param params Paramètres contenant la clé de chiffrement.
 * @returns ValidationResult indiquant le succès ou les erreurs constatées.
 */
export function validate(params: VigenereParams): ValidationResult {
  if (!params || typeof params.key !== 'string' || params.key.trim() === '') {
    return {
      valid: false,
      errors: [
        {
          key: 'vigenere.errors.emptyKey',
        },
      ],
    };
  }

  const invalidChars: string[] = [];
  const seenChars = new Set<string>();

  for (const char of params.key) {
    if (!isLetter(char)) {
      if (!seenChars.has(char)) {
        seenChars.add(char);
        invalidChars.push(char);
      }
    }
  }

  if (invalidChars.length > 0) {
    return {
      valid: false,
      errors: [
        {
          key: 'vigenere.errors.invalidKeyCharacters',
          params: { characters: invalidChars.join('') },
        },
      ],
    };
  }

  return { valid: true };
}

/**
 * Valide les paramètres de Vigenère et lève une exception en cas d'erreur.
 *
 * @param params Paramètres à contrôler.
 * @throws {Error} Si les paramètres sont invalides.
 */
function assertValid(params: VigenereParams): void {
  const validation = validate(params);
  if (!validation.valid) {
    throw new Error('Paramètres de Vigenère invalides.');
  }
}

/**
 * Aligne cycliquement la clé sur le texte donné.
 *
 * Pour chaque lettre ASCII du texte, la lettre correspondante de la clé (en majuscules)
 * est placée à la même position. Les caractères non alphabétiques reçoivent un espace ' '
 * et ne font pas avancer le pointeur dans la clé.
 *
 * @param text Texte de référence.
 * @param key Clé de chiffrement.
 * @returns Chaîne alignée de même longueur UTF-16 que le texte.
 * @throws {Error} Si la clé est invalide.
 */
export function alignKey(text: string, key: string): string {
  assertValid({ key });
  const normalizedKey = normalizeKey(key);
  let result = '';
  let keyPointer = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (isLetter(char)) {
      const keyChar = normalizedKey[keyPointer % normalizedKey.length]!;
      result += keyChar;
      keyPointer++;
    } else {
      result += ' ';
    }
  }

  return result;
}

/**
 * Chiffre un texte avec le chiffre de Vigenère.
 *
 * Formule : Ci = (Pi + Ki) mod 26.
 * Seules les lettres ASCII sont chiffrées ; la casse est préservée.
 * Les caractères non alphabétiques restent inchangés et ne consomment pas de lettre de la clé.
 *
 * @param text Texte en clair à chiffrer.
 * @param params Paramètres contenant la clé.
 * @returns Le texte chiffré.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function encrypt(text: string, params: VigenereParams): string {
  assertValid(params);
  const normalizedKey = normalizeKey(params.key);
  let result = '';
  let keyPointer = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (isLetter(char)) {
      const isUpper = isUpperLetter(char);
      const inputVal = letterToIndex(char);
      const keyChar = normalizedKey[keyPointer % normalizedKey.length]!;
      const keyVal = letterToIndex(keyChar);
      const cipherVal = mod(inputVal + keyVal, ALPHABET_SIZE);
      result += indexToLetter(cipherVal, isUpper);
      keyPointer++;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Déchiffre un texte chiffré avec le chiffre de Vigenère.
 *
 * Formule : Pi = (Ci - Ki) mod 26.
 * Seules les lettres ASCII sont déchiffrées ; la casse est préservée.
 * Les caractères non alphabétiques restent inchangés et ne consomment pas de lettre de la clé.
 *
 * @param text Texte chiffré à déchiffrer.
 * @param params Paramètres contenant la clé.
 * @returns Le texte en clair déchiffré.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function decrypt(text: string, params: VigenereParams): string {
  assertValid(params);
  const normalizedKey = normalizeKey(params.key);
  let result = '';
  let keyPointer = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (isLetter(char)) {
      const isUpper = isUpperLetter(char);
      const inputVal = letterToIndex(char);
      const keyChar = normalizedKey[keyPointer % normalizedKey.length]!;
      const keyVal = letterToIndex(keyChar);
      const plainVal = mod(inputVal - keyVal, ALPHABET_SIZE);
      result += indexToLetter(plainVal, isUpper);
      keyPointer++;
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
 * Les caractères non alphabétiques ne sont pas transformés et ne produisent pas d'étape,
 * mais restent intacts dans `output` et ne font pas avancer le pointeur dans la clé.
 *
 * @param text Texte source à traiter.
 * @param params Paramètres contenant la clé.
 * @param mode Mode d'opération ('encrypt' ou 'decrypt').
 * @returns Un objet AlgorithmResult contenant l'entrée, la sortie complète et chaque étape unitaire.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function getSteps(
  text: string,
  params: VigenereParams,
  mode: OperationMode,
): AlgorithmResult<VigenereStepData> {
  assertValid(params);

  const normalizedKey = normalizeKey(params.key);
  const steps: ExecutionStep<VigenereStepData>[] = [];
  let output = '';
  let letterIndex = 0;

  for (let position = 0; position < text.length; position++) {
    const char = text[position]!;

    if (!isLetter(char)) {
      output += char;
      continue;
    }

    const isUpper = isUpperLetter(char);
    const inputValue = letterToIndex(char);
    const keyIndex = letterIndex % normalizedKey.length;
    const keyLetter = normalizedKey[keyIndex]!;
    const keyValue = letterToIndex(keyLetter);

    let rawResult: number;
    let outputValue: number;
    let calculation: string;
    let wrapped: boolean;

    if (mode === 'encrypt') {
      rawResult = inputValue + keyValue;
      outputValue = mod(rawResult, ALPHABET_SIZE);
      calculation = `(${inputValue} + ${keyValue}) mod 26 = ${outputValue}`;
      wrapped = rawResult >= ALPHABET_SIZE;
    } else {
      rawResult = inputValue - keyValue;
      outputValue = mod(rawResult, ALPHABET_SIZE);
      calculation = `(${inputValue} - ${keyValue}) mod 26 = ${outputValue}`;
      wrapped = rawResult < 0;
    }

    const outputLetter = indexToLetter(outputValue, isUpper);
    output += outputLetter;

    const explanationKey = mode === 'encrypt' ? 'vigenere.steps.encrypt' : 'vigenere.steps.decrypt';

    steps.push({
      index: letterIndex,
      input: char,
      key: keyLetter,
      calculation,
      output: outputLetter,
      explanation: {
        key: explanationKey,
        params: {
          letter: char,
          letterValue: inputValue,
          keyLetter,
          keyValue,
          rawResult,
          outputValue,
          outputLetter,
        },
      },
      data: {
        position,
        letterIndex,
        keyIndex,
        keyLetter,
        inputValue,
        keyValue,
        rawResult,
        outputValue,
        wrapped,
        isUpper,
      },
    });

    letterIndex++;
  }

  return {
    input: text,
    output,
    steps,
  };
}

/**
 * Instance CipherAlgorithm pour le chiffre de Vigenère.
 */
export const vigenereAlgorithm: CipherAlgorithm<VigenereParams, VigenereStepData> = {
  id: 'vigenere',
  validate,
  encrypt,
  decrypt,
  getSteps,
};
