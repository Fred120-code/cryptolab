import type { TranslatableText } from './i18n';

/**
 * Identifiants uniques des algorithmes cryptographiques supportés par la plateforme.
 */
export type AlgorithmId = 'caesar' | 'substitution' | 'permutation' | 'vigenere';

/**
 * Mode d'opération cryptographique : chiffrement ou déchiffrement.
 */
export type OperationMode = 'encrypt' | 'decrypt';

/**
 * Résultat de validation des paramètres fournis pour un algorithme.
 *
 * Utilise une union discriminée pour garantir la sécurité à la compilation :
 * - Si `valid` vaut `true`, aucun champ d'erreur n'est présent.
 * - Si `valid` vaut `false`, la liste `errors` contient les clés de messages explicatifs à traduire.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: TranslatableText[] };

/**
 * Détail d'une étape de calcul unitaire dans l'exécution de l'algorithme.
 *
 * Conçu pour alimenter directement les composants de visualisation animée sans dépendance à React.
 *
 * @template TData Informations additionnelles propres à l'algorithme (ex: indices, sous-matrices, positions).
 */
export interface ExecutionStep<TData = undefined> {
  /** Numéro d'ordre séquentiel de l'étape (commençant à 0 ou 1) */
  index: number;
  /** Caractère ou fragment d'entrée traité à cette étape */
  input: string;
  /** Clé ou composante de clé appliquée à cette étape (optionnelle) */
  key?: string | number;
  /**
   * Expression du calcul sous forme de formule mathématique indépendante de la langue.
   * Exemple : "(0 + 3) mod 26 = 3"
   */
  calculation: string;
  /** Caractère ou fragment produit en sortie pour cette étape */
  output: string;
  /** Explication pédagogique textuelle sous forme traduisible */
  explanation: TranslatableText;
  /** Données contextuelles spécialisées pour le visualiseur animé */
  data: TData;
}

/**
 * Résultat complet retourné lors du calcul des étapes de l'algorithme.
 *
 * @template TData Informations contextuelles spécifiques transmises à chaque étape d'exécution.
 */
export interface AlgorithmResult<TData = undefined> {
  /** Texte brut initial fourni en entrée */
  input: string;
  /** Texte final obtenu après traitement complet */
  output: string;
  /** Liste ordonnée de toutes les étapes intermédiaires du calcul */
  steps: ExecutionStep<TData>[];
}

/**
 * Contrat d'interface unifié que chaque algorithme de chiffrement classique doit implémenter.
 *
 * Le moteur est pur et déterministe : il ne dépend ni de React, ni du DOM, ni de bibliothèques tierces.
 *
 * @template TParams Structure des paramètres et clés requise par l'algorithme (ex: décalage César, alphabet de substitution).
 * @template TData Données de contexte produites pour les visualiseurs animés.
 */
export interface CipherAlgorithm<TParams, TData = undefined> {
  /** Identifiant unique de l'algorithme */
  readonly id: AlgorithmId;

  /**
   * Vérifie la conformité et la validité des paramètres fournis (clé, alphabet, etc.).
   *
   * @param params Paramètres de configuration à contrôler.
   * @returns Un objet ValidationResult indiquant le succès ou la liste des erreurs traduisibles.
   */
  validate(params: TParams): ValidationResult;

  /**
   * Chiffre le texte en appliquant les paramètres donnés.
   *
   * @param text Texte clair à chiffrer.
   * @param params Clé et options de chiffrement.
   * @returns Le texte chiffré.
   */
  encrypt(text: string, params: TParams): string;

  /**
   * Déchiffre le texte en appliquant les paramètres donnés.
   *
   * @param text Texte chiffré à déchiffrer.
   * @param params Clé et options de déchiffrement.
   * @returns Le texte déchiffré en clair.
   */
  decrypt(text: string, params: TParams): string;

  /**
   * Exécute l'algorithme en calculant l'ensemble des étapes détaillées pour l'animation et l'explication.
   *
   * @param text Texte source à traiter.
   * @param params Clé et options requises.
   * @param mode Mode d'opération ('encrypt' ou 'decrypt').
   * @returns Un objet AlgorithmResult contenant la sortie finale et chaque étape d'exécution.
   */
  getSteps(text: string, params: TParams, mode: OperationMode): AlgorithmResult<TData>;
}
