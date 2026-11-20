/**
 * Paramètres requis pour le chiffrement par substitution monoalphabétique.
 */
export interface SubstitutionParams {
  /**
   * Alphabet de substitution de 26 lettres (sensible ou insensible à la casse selon normalisation).
   * L'indice `i` de l'alphabet standard (A=0, B=1...) correspond à `alphabet[i]`.
   */
  alphabet: string;
}

/**
 * Entrée élémentaire du tableau de correspondance (mapping table).
 */
export interface SubstitutionMappingEntry {
  /** Lettre claire de l'alphabet standard ('A' à 'Z') */
  plain: string;
  /** Lettre chiffrée correspondante dans l'alphabet de substitution */
  cipher: string;
  /** Index dans l'alphabet standard (0 pour A, 25 pour Z) */
  index: number;
}

/**
 * Données de contexte produites pour chaque étape de calcul du chiffrement par substitution.
 * Permet aux visualiseurs animés d'illustrer la substitution de chaque lettre.
 */
export interface SubstitutionStepData {
  /** Index d'unité UTF-16 du caractère dans le texte complet source (0-based) */
  position: number;
  /** Index de la lettre claire dans l'alphabet de base (0 à 25) */
  plainIndex: number;
  /** Index de la lettre chiffrée dans l'alphabet de base (0 à 25) */
  cipherIndex: number;
  /** Lettre claire (en majuscule) */
  plainLetter: string;
  /** Lettre chiffrée correspondante (en majuscule) */
  cipherLetter: string;
  /** Alphabet de substitution complet normalisé en majuscules (26 caractères) */
  alphabet: string;
  /** Indique si le caractère d'origine était une majuscule */
  isUpper: boolean;
  /** Indique si la lettre est un point fixe (remplacée par elle-même) */
  isFixedPoint: boolean;
}
