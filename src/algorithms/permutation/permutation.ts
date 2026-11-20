import type { TranslatableText, ValidationResult } from '@/types';
import type { PermutationParams } from './types';

/** Taille minimale d'un bloc de permutation. */
export const MIN_BLOCK_SIZE = 2;

/** Taille maximale d'un bloc de permutation. */
export const MAX_BLOCK_SIZE = 16;

/**
 * Découpe une chaîne en liste de nombres entiers représentant une permutation.
 * Accepte comme séparateurs les virgules, points-virgules et espaces.
 *
 * @param input Chaîne utilisateur (ex: "2, 4, 1, 3" ou "2 4 1 3").
 * @returns Tableau de nombres analysés (les fragments invalides deviennent `NaN`).
 */
export function parsePermutation(input: string): number[] {
  const trimmed = input.trim();
  if (trimmed === '') return [];

  const parts = trimmed.split(/[\s,;]+/).filter((p) => p.length > 0);
  return parts.map((part) => {
    const num = Number(part);
    return Number.isFinite(num) ? num : NaN;
  });
}

/**
 * Valide les paramètres fournis pour la permutation de blocs.
 *
 * Cumule toutes les erreurs constatées :
 * - `permutation.errors.invalidBlockSize` si la longueur est hors de [MIN_BLOCK_SIZE, MAX_BLOCK_SIZE].
 * - `permutation.errors.notIntegers` pour les valeurs non entières ou NaN.
 * - `permutation.errors.outOfRange` pour les valeurs hors de l'intervalle [1, blockSize].
 * - `permutation.errors.duplicateValues` pour les valeurs présentes plusieurs fois.
 * - `permutation.errors.missingValues` pour les entiers de 1 à blockSize absents.
 * - `permutation.errors.invalidPadding` si paddingLength n'est pas un entier de 0 à blockSize - 1.
 *
 * @param params Paramètres de permutation à contrôler.
 * @returns Un objet ValidationResult conforme.
 */
export function validate(params: PermutationParams): ValidationResult {
  const errors: TranslatableText[] = [];

  if (!params || !Array.isArray(params.permutation)) {
    return {
      valid: false,
      errors: [
        {
          key: 'permutation.errors.invalidBlockSize',
          params: { size: 0, min: MIN_BLOCK_SIZE, max: MAX_BLOCK_SIZE },
        },
      ],
    };
  }

  const { permutation, paddingLength } = params;
  const n = permutation.length;

  // 1. Taille de bloc
  if (n < MIN_BLOCK_SIZE || n > MAX_BLOCK_SIZE) {
    errors.push({
      key: 'permutation.errors.invalidBlockSize',
      params: { size: n, min: MIN_BLOCK_SIZE, max: MAX_BLOCK_SIZE },
    });
  }

  // 2. Entiers et NaN
  const notIntegers: string[] = [];
  const seenNotIntegers = new Set<string>();
  for (const v of permutation) {
    if (typeof v !== 'number' || !Number.isSafeInteger(v)) {
      const repr = String(v);
      if (!seenNotIntegers.has(repr)) {
        seenNotIntegers.add(repr);
        notIntegers.push(repr);
      }
    }
  }
  if (notIntegers.length > 0) {
    errors.push({
      key: 'permutation.errors.notIntegers',
      params: { values: notIntegers.join(', ') },
    });
  }

  // 3. Hors plage (uniquement parmi les entiers valides)
  const outOfRange: string[] = [];
  const seenOutOfRange = new Set<string>();
  for (const v of permutation) {
    if (typeof v === 'number' && Number.isSafeInteger(v) && (v < 1 || v > n)) {
      const repr = String(v);
      if (!seenOutOfRange.has(repr)) {
        seenOutOfRange.add(repr);
        outOfRange.push(repr);
      }
    }
  }
  if (outOfRange.length > 0) {
    errors.push({
      key: 'permutation.errors.outOfRange',
      params: { values: outOfRange.join(', '), blockSize: n },
    });
  }

  // 4. Doublons
  const seenValues = new Set<number>();
  const duplicates: string[] = [];
  const recordedDuplicates = new Set<string>();
  for (const v of permutation) {
    if (typeof v === 'number' && Number.isSafeInteger(v)) {
      if (seenValues.has(v)) {
        const repr = String(v);
        if (!recordedDuplicates.has(repr)) {
          recordedDuplicates.add(repr);
          duplicates.push(repr);
        }
      } else {
        seenValues.add(v);
      }
    }
  }
  if (duplicates.length > 0) {
    errors.push({
      key: 'permutation.errors.duplicateValues',
      params: { values: duplicates.join(', ') },
    });
  }

  // 5. Valeurs manquantes de 1 à n
  if (n >= MIN_BLOCK_SIZE && n <= MAX_BLOCK_SIZE) {
    const missing: string[] = [];
    for (let expected = 1; expected <= n; expected++) {
      if (!permutation.includes(expected)) {
        missing.push(String(expected));
      }
    }
    if (missing.length > 0) {
      errors.push({
        key: 'permutation.errors.missingValues',
        params: { values: missing.join(', ') },
      });
    }
  }

  // 6. Padding length
  if (paddingLength !== undefined) {
    if (
      typeof paddingLength !== 'number' ||
      !Number.isSafeInteger(paddingLength) ||
      paddingLength < 0 ||
      (n > 0 && paddingLength >= n)
    ) {
      errors.push({
        key: 'permutation.errors.invalidPadding',
        params: { paddingLength: String(paddingLength), blockSize: n },
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Valide qu'un texte chiffré possède une longueur compatible (multiple de la taille de bloc).
 *
 * @param text Texte à valider (souvent après normalisation).
 * @param params Paramètres de permutation.
 * @returns Un objet ValidationResult.
 */
export function validateCiphertext(text: string, params: PermutationParams): ValidationResult {
  const blockSize = params.permutation?.length ?? 0;
  if (blockSize === 0 || text.length % blockSize !== 0) {
    return {
      valid: false,
      errors: [
        {
          key: 'permutation.errors.ciphertextLengthNotMultiple',
          params: { length: text.length, blockSize },
        },
      ],
    };
  }

  return { valid: true };
}

/**
 * Calcule l'inverse d'une permutation en base 1.
 *
 * Pour une permutation p sur [1..n], son inverse `inv` vérifie :
 * `inv[p[i] - 1] = i + 1` pour tout i de 0 à n-1.
 *
 * @param p Permutation valide en base 1.
 * @returns La permutation inverse en base 1.
 * @throws {Error} Si la permutation n'est pas valide.
 */
export function invertPermutation(p: number[]): number[] {
  const validation = validate({ permutation: p });
  if (!validation.valid) {
    throw new Error('Permutation invalide : impossible de calculer son inverse.');
  }

  const n = p.length;
  const inv = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    inv[p[i]! - 1] = i + 1;
  }
  return inv;
}

/**
 * Calcule le nombre de caractères de remplissage ('X') requis pour compléter le dernier bloc.
 *
 * @param textLength Longueur du texte (en nombre de caractères).
 * @param blockSize Taille du bloc de permutation.
 * @returns Nombre de caractères à ajouter (compris entre 0 et blockSize - 1).
 */
export function getPaddingLength(textLength: number, blockSize: number): number {
  if (blockSize <= 0) return 0;
  return (blockSize - (textLength % blockSize)) % blockSize;
}
