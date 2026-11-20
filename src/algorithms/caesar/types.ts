/**
 * Paramètres requis pour le chiffrement de César.
 */
export interface CaesarParams {
  /**
   * Valeur du décalage (clé de chiffrement).
   * Doit être un entier fini (peut être négatif ou supérieur à 25).
   */
  shift: number;
}

/**
 * Données de contexte produites pour chaque étape de calcul du chiffrement de César.
 * Permet aux visualiseurs animés de représenter précisément les transformations de chaque lettre.
 */
export interface CaesarStepData {
  /** Index d'unité UTF-16 du caractère dans le texte complet source (indice dans la chaîne JavaScript, 0-based) */
  position: number;
  /** Index numérique de la lettre d'entrée dans l'alphabet (0 à 25) */
  inputIndex: number;
  /** Index numérique de la lettre de sortie dans l'alphabet (0 à 25) */
  outputIndex: number;
  /** Clé de décalage normalisée dans l'intervalle [0, 25] */
  shift: number;
  /** Clé brute telle que fournie par l'utilisateur */
  rawShift: number;
  /** Indique si le calcul a dépassé 'Z' (bouclage vers 'A') ou est passé sous 'A' (bouclage vers 'Z') */
  wrapped: boolean;
  /** Indique si la lettre traitée était en majuscule */
  isUpper: boolean;
}
