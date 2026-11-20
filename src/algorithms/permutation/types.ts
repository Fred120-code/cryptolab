/**
 * Déplacement élémentaire d'un caractère au sein d'un bloc permuté.
 */
export interface PermutationMove {
  /** Caractère déplacé */
  char: string;
  /** Position d'origine dans le bloc d'entrée (0-based) */
  from: number;
  /** Position de destination dans le bloc de sortie (0-based) */
  to: number;
  /** Indique si ce caractère correspond à un caractère de remplissage ('X') */
  isPadding: boolean;
}

/**
 * Paramètres requis pour le chiffrement par permutation de blocs.
 */
export interface PermutationParams {
  /**
   * Tableau d'entiers en base 1 représentant la permutation des positions dans un bloc.
   * La taille de bloc correspond à `permutation.length`.
   * Exemple : `[2, 4, 1, 3]` signifie que le 1er caractère en sortie provient de l'indice 2 en entrée.
   */
  permutation: number[];

  /**
   * Nombre de caractères de remplissage ('X') ajoutés lors du chiffrement à retirer lors du déchiffrement.
   * Optionnel, ignoré au chiffrement. Doit être compris entre 0 et `blockSize - 1`.
   */
  paddingLength?: number;
}

/**
 * Données de contexte produites pour chaque étape de calcul (un bloc de texte).
 */
export interface PermutationStepData {
  /** Index du bloc (0-based) */
  blockIndex: number;
  /** Index du premier caractère du bloc dans le texte normalisé complet (0-based) */
  startPosition: number;
  /** Taille du bloc */
  blockSize: number;
  /** Permutation effectivement appliquée au bloc (base 1) */
  permutation: number[];
  /** Liste ordonnée des mouvements de caractères vers chaque position de sortie */
  moves: PermutationMove[];
  /** Nombre de caractères de remplissage dans ce bloc */
  paddingCount: number;
  /** Indique si ce bloc contient au moins un caractère de remplissage */
  hasPadding: boolean;
}
