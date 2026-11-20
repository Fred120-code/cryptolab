/**
 * Paramètres nécessaires pour le chiffrement et déchiffrement de Vigenère.
 */
export interface VigenereParams {
  /** Clé secrète sous forme de chaîne de caractères alphabétiques */
  key: string;
}

/**
 * Données détaillées pour chaque étape de chiffrement ou déchiffrement de Vigenère.
 */
export interface VigenereStepData {
  /** Position UTF-16 dans le texte complet */
  position: number;
  /** Index parmi les lettres traitées (basé sur 0) */
  letterIndex: number;
  /** Index de la lettre dans la clé (basé sur 0, périodique) */
  keyIndex: number;
  /** Lettre de la clé utilisée (toujours en majuscule) */
  keyLetter: string;
  /** Valeur numérique de la lettre d'entrée (0..25) */
  inputValue: number;
  /** Valeur numérique de la lettre de la clé (0..25) */
  keyValue: number;
  /** Résultat brut avant modulo (input + key en chiffrement, input - key en déchiffrement) */
  rawResult: number;
  /** Valeur numérique de sortie après modulo 26 (0..25) */
  outputValue: number;
  /** Indique un rebouclage sur l'alphabet (rawResult >= 26 en chiffrement, rawResult < 0 en déchiffrement) */
  wrapped: boolean;
  /** Indique si la lettre originale était en majuscule */
  isUpper: boolean;
}
