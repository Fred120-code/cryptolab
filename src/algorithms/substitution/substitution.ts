import type {
  AlgorithmResult,
  CipherAlgorithm,
  OperationMode,
  TranslatableText,
  ValidationResult,
} from '@/types';
import {
  ALPHABET_SIZE,
  indexToLetter,
  isLetter,
  isUpperLetter,
  letterToIndex,
} from '@/utils/alphabet';
import type { SubstitutionMappingEntry, SubstitutionParams, SubstitutionStepData } from './types';

/**
 * Construit un alphabet de substitution complet de 26 lettres à partir d'un mot-clé.
 *
 * Règles appliquées :
 * - Le mot-clé est converti en majuscules.
 * - Tout caractère qui n'est pas une lettre ASCII (A-Z) est ignoré.
 * - Les doublons sont éliminés en conservant la première occurrence de chaque lettre.
 * - La chaîne est ensuite complétée par les lettres de l'alphabet standard restantes dans l'ordre alphabétique.
 *
 * @param keyword Mot-clé ou phrase servant de base à la permutation de l'alphabet.
 * @returns Un alphabet de substitution de 26 lettres majuscules uniques.
 * @example
 * buildAlphabetFromKeyword('SECURITE')
 * // 'SECURITABDFGHJKLMNOPQVWXYZ'
 */
export function buildAlphabetFromKeyword(keyword: string): string {
  const seen = new Set<string>();
  let result = '';

  for (const char of keyword.toUpperCase()) {
    if (isUpperLetter(char) && !seen.has(char)) {
      seen.add(char);
      result += char;
    }
  }

  for (let i = 0; i < ALPHABET_SIZE; i++) {
    const char = indexToLetter(i, true);
    if (!seen.has(char)) {
      seen.add(char);
      result += char;
    }
  }

  return result;
}

/**
 * Valide les paramètres fournis pour le chiffrement par substitution.
 *
 * L'alphabet doit satisfaire simultanément les critères suivants :
 * - Contenir exactement 26 caractères.
 * - Ne comporter que des lettres de l'alphabet latin ASCII (A-Z / a-z).
 * - Ne comporter aucun doublon (insensible à la casse), garantissant une bijection stricte.
 *
 * Retourne l'ensemble de toutes les erreurs applicables (non exclusif).
 *
 * @param params Paramètres contenant l'alphabet à valider.
 * @returns Un objet ValidationResult conforme.
 */
export function validate(params: SubstitutionParams): ValidationResult {
  const { alphabet } = params;
  const errors: TranslatableText[] = [];

  if (typeof alphabet !== 'string') {
    return {
      valid: false,
      errors: [
        {
          key: 'substitution.errors.invalidLength',
          params: { length: 0 },
        },
      ],
    };
  }

  // 1. Longueur
  if (alphabet.length !== ALPHABET_SIZE) {
    errors.push({
      key: 'substitution.errors.invalidLength',
      params: { length: alphabet.length },
    });
  }

  // 2. Caractères non-lettres ASCII (sans doublon dans la liste d'erreurs)
  const invalidChars: string[] = [];
  const seenInvalid = new Set<string>();

  for (const char of alphabet) {
    if (!isLetter(char) && !seenInvalid.has(char)) {
      seenInvalid.add(char);
      invalidChars.push(char);
    }
  }

  if (invalidChars.length > 0) {
    errors.push({
      key: 'substitution.errors.invalidCharacters',
      params: { characters: invalidChars.join('') },
    });
  }

  // 3. Doublons (insensible à la casse)
  const seenLetters = new Set<string>();
  const duplicateLetters: string[] = [];
  const recordedDuplicates = new Set<string>();

  for (const char of alphabet.toUpperCase()) {
    if (isUpperLetter(char)) {
      if (seenLetters.has(char)) {
        if (!recordedDuplicates.has(char)) {
          recordedDuplicates.add(char);
          duplicateLetters.push(char);
        }
      } else {
        seenLetters.add(char);
      }
    }
  }

  if (duplicateLetters.length > 0) {
    errors.push({
      key: 'substitution.errors.duplicateLetters',
      params: { letters: duplicateLetters.join('') },
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Valide les paramètres de substitution et lève une exception en cas d'erreur.
 *
 * @param params Paramètres de substitution à vérifier.
 * @throws {Error} Si l'alphabet est non conforme.
 */
function assertValid(params: SubstitutionParams): void {
  const validation = validate(params);
  if (!validation.valid) {
    throw new Error('Paramètres de substitution invalides.');
  }
}

/**
 * Calcule l'alphabet inverse (alphabet de déchiffrement).
 *
 * Pour chaque lettre de l'alphabet standard à la position `i`, si `alphabet[i] = C`,
 * alors dans l'alphabet inversé, la lettre `C` correspondra à la position `i`.
 *
 * @param alphabet Alphabet de chiffrement valide de 26 lettres.
 * @returns L'alphabet inverse en majuscules.
 * @throws {Error} Si l'alphabet fourni est invalide.
 */
export function invertAlphabet(alphabet: string): string {
  assertValid({ alphabet });

  const upper = alphabet.toUpperCase();
  const inverseArray: string[] = new Array<string>(ALPHABET_SIZE);

  for (let i = 0; i < ALPHABET_SIZE; i++) {
    const cipherChar = upper[i]!;
    const cipherIndex = letterToIndex(cipherChar);
    const plainChar = indexToLetter(i, true);
    inverseArray[cipherIndex] = plainChar;
  }

  return inverseArray.join('');
}

/**
 * Génère le tableau de correspondance complet pour l'alphabet fourni.
 *
 * @param alphabet Alphabet de substitution de 26 lettres.
 * @returns Une liste de 26 entrées associant chaque lettre claire à sa lettre chiffrée.
 * @throws {Error} Si l'alphabet fourni est invalide.
 */
export function getMappingTable(alphabet: string): SubstitutionMappingEntry[] {
  assertValid({ alphabet });

  const upper = alphabet.toUpperCase();
  const table: SubstitutionMappingEntry[] = [];

  for (let i = 0; i < ALPHABET_SIZE; i++) {
    table.push({
      plain: indexToLetter(i, true),
      cipher: upper[i]!,
      index: i,
    });
  }

  return table;
}

/**
 * Chiffre un texte avec l'alphabet de substitution monoalphabétique.
 *
 * Seules les lettres ASCII sont remplacées en conservant leur casse.
 * Tous les autres caractères demeurent inchangés.
 *
 * @param text Texte clair à chiffrer.
 * @param params Paramètres avec l'alphabet de substitution.
 * @returns Le texte chiffré.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function encrypt(text: string, params: SubstitutionParams): string {
  assertValid(params);

  const upperAlphabet = params.alphabet.toUpperCase();
  let result = '';

  for (const char of text) {
    if (isLetter(char)) {
      const upper = isUpperLetter(char);
      const index = letterToIndex(char);
      const cipherChar = upperAlphabet[index]!;
      result += upper ? cipherChar : cipherChar.toLowerCase();
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Déchiffre un texte chiffré par substitution monoalphabétique.
 *
 * Seules les lettres ASCII sont déchiffrées en conservant leur casse.
 * Tous les autres caractères demeurent inchangés.
 *
 * @param text Texte chiffré à déchiffrer.
 * @param params Paramètres avec l'alphabet de substitution utilisé lors du chiffrement.
 * @returns Le texte déchiffré en clair.
 * @throws {Error} Si les paramètres sont invalides.
 */
export function decrypt(text: string, params: SubstitutionParams): string {
  assertValid(params);

  const inverse = invertAlphabet(params.alphabet);
  let result = '';

  for (const char of text) {
    if (isLetter(char)) {
      const upper = isUpperLetter(char);
      const index = letterToIndex(char);
      const plainChar = inverse[index]!;
      result += upper ? plainChar : plainChar.toLowerCase();
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Calcule l'ensemble des étapes d'exécution détaillées pour le chiffrement/déchiffrement par substitution.
 *
 * (Sera implémenté au commit 3).
 *
 * @param _text Texte source à traiter.
 * @param _params Paramètres avec l'alphabet de substitution.
 * @param _mode Mode d'opération ('encrypt' ou 'decrypt').
 * @returns Un objet AlgorithmResult.
 * @throws {Error} Actuellement non implémenté.
 */
export function getSteps(
  _text: string,
  _params: SubstitutionParams,
  _mode: OperationMode,
): AlgorithmResult<SubstitutionStepData> {
  throw new Error('not implemented');
}

/**
 * Instance CipherAlgorithm pour le chiffrement par substitution.
 */
export const substitutionAlgorithm: CipherAlgorithm<SubstitutionParams, SubstitutionStepData> = {
  id: 'substitution',
  validate,
  encrypt,
  decrypt,
  getSteps,
};
