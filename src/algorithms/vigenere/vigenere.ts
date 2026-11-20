import type { AlgorithmResult, CipherAlgorithm, OperationMode, ValidationResult } from '@/types';
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
 * Formule : $C_i = (P_i + K_i) \pmod{26}$.
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
 * Formule : $P_i = (C_i - K_i) \pmod{26}$.
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
 * Calcule les étapes d'exécution détaillées pour le chiffrement ou déchiffrement de Vigenère.
 *
 * @param _text Texte source.
 * @param _params Paramètres de Vigenère.
 * @param _mode Mode d'opération ('encrypt' ou 'decrypt').
 * @returns Résultat de l'algorithme avec les étapes pas à pas.
 * @throws {Error} Si non implémenté ou paramètres invalides.
 */
export function getSteps(
  _text: string,
  _params: VigenereParams,
  _mode: OperationMode,
): AlgorithmResult<VigenereStepData> {
  throw new Error('not implemented');
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
