/**
 * Représente une clé de traduction avec des paramètres d'interpolation facultatifs.
 *
 * Ce type permet de découpler entièrement le moteur cryptographique de l'infrastructure
 * d'internationalisation (i18n). Les explications étape par étape et les messages
 * d'erreur retournés par le moteur contiennent uniquement la clé et ses variables dynamiques,
 * la traduction concrète étant résolue plus tard au niveau de l'interface utilisateur.
 */
export interface TranslatableText {
  /** Clé de traduction (par exemple 'caesar.errors.invalidShift') */
  key: string;
  /** Paramètres dynamiques passés au moteur de traduction */
  params?: Record<string, string | number>;
}
