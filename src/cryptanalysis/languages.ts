/**
 * Langues supportées par le moteur d'analyse cryptographique.
 */
export const ANALYSIS_LANGUAGES = ['fr', 'en'] as const;

/**
 * Identifiant d'une langue d'analyse.
 */
export type AnalysisLanguage = (typeof ANALYSIS_LANGUAGES)[number];

/**
 * Choix de langue fourni par l'utilisateur (`'auto'` pour la détection automatique).
 */
export type LanguageChoice = AnalysisLanguage | 'auto';

const RAW_LETTER_FREQUENCIES: Record<AnalysisLanguage, readonly number[]> = {
  en: [
    8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772, 4.025, 2.406,
    6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978, 2.36, 0.15, 1.974, 0.074,
  ],
  fr: [
    7.636, 0.901, 3.26, 3.669, 14.715, 1.066, 0.866, 0.737, 7.529, 0.613, 0.049, 5.456, 2.968,
    7.095, 5.796, 2.521, 1.362, 6.693, 7.948, 7.244, 6.311, 1.838, 0.074, 0.427, 0.128, 0.326,
  ],
};

/**
 * Renormalise un tableau de fréquences pour que sa somme vaille exactement 100.
 * Les valeurs sources françaises ne somment pas 100 car les lettres accentuées y sont
 * comptabilisées à part : la division par la somme rétablit une distribution sur A-Z.
 */
function normalizeFrequencies(values: readonly number[]): readonly number[] {
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Object.freeze(values.map((v) => (v / sum) * 100));
}

/**
 * Fréquences relatives des 26 lettres A-Z (en pourcentage, somme = 100) par langue.
 */
export const LETTER_FREQUENCIES: Record<AnalysisLanguage, readonly number[]> = {
  fr: normalizeFrequencies(RAW_LETTER_FREQUENCIES.fr),
  en: normalizeFrequencies(RAW_LETTER_FREQUENCIES.en),
};

/**
 * Dictionnaire de mots courants (majuscules ASCII A-Z, 4 lettres ou plus) utilisés
 * pour estimer la lisibilité d'un texte déchiffré.
 */
export const COMMON_WORDS: Record<AnalysisLanguage, readonly string[]> = {
  fr: [
    'BONJOUR',
    'EXAMEN',
    'SECURITE',
    'INFORMATIQUE',
    'CRYPTOGRAPHIE',
    'MESSAGE',
    'CHIFFREMENT',
    'DECHIFFREMENT',
    'ALGORITHME',
    'PERMUTATION',
    'SUBSTITUTION',
    'VIGENERE',
    'CESAR',
    'CLASSIQUE',
    'DISCIPLINE',
    'FONDAMENTALE',
    'SECRET',
    'AVEC',
    'POUR',
    'DANS',
    'NOUS',
    'VOUS',
    'SONT',
    'MAIS',
    'COMME',
    'CETTE',
    'PLUS',
    'TOUT',
    'BIEN',
    'FAIRE',
    'DIRE',
    'ETRE',
    'AVOIR',
    'ALLER',
    'VOIR',
    'SAVOIR',
    'POUVOIR',
    'VOULOIR',
    'DEVOIR',
    'PRENDRE',
    'DONNER',
    'METTRE',
    'PASSER',
    'RESTER',
    'PARLER',
    'AIMER',
    'TROUVER',
    'DONC',
    'ALORS',
    'QUAND',
    'DEJA',
    'TOUJOURS',
    'JAMAIS',
    'ENCORE',
    'BEAUCOUP',
    'PETIT',
    'GRAND',
    'AUTRE',
    'MEME',
    'SEUL',
    'PREMIER',
    'DERNIER',
    'TEMPS',
    'JOUR',
    'NUIT',
    'MONDE',
    'HOMME',
    'FEMME',
    'PAYS',
    'VILLE',
    'VIEUX',
    'JEUNE',
    'NOUVEAU',
    'COURS',
    'TEXTE',
    'LETTRE',
    'CODE',
    'CLEF',
    'DONNEES',
    'SYSTEME',
  ],
  en: [
    'HELLO',
    'WORLD',
    'SECURITY',
    'MESSAGE',
    'SECRET',
    'THIS',
    'THAT',
    'WITH',
    'FROM',
    'HAVE',
    'WILL',
    'YOUR',
    'ENCRYPTION',
    'ALGORITHM',
    'EXAMPLE',
    'CIPHER',
    'STUDENT',
    'THEY',
    'THEIR',
    'THERE',
    'WHERE',
    'WHEN',
    'WHAT',
    'WHICH',
    'ABOUT',
    'WOULD',
    'COULD',
    'SHOULD',
    'OTHER',
    'SOME',
    'TIME',
    'YEAR',
    'PEOPLE',
    'WORK',
    'MAKE',
    'KNOW',
    'TAKE',
    'COME',
    'THINK',
    'LOOK',
    'WANT',
    'GIVE',
    'FIND',
    'TELL',
    'CALL',
    'GOOD',
    'VERY',
    'JUST',
    'ONLY',
    'ALSO',
    'BACK',
    'AFTER',
    'FIRST',
    'WELL',
    'EVEN',
    'MOST',
    'MUCH',
    'MANY',
    'MORE',
    'SUCH',
    'HERE',
    'THEN',
    'THAN',
    'INTO',
    'OVER',
    'UNDER',
    'BETWEEN',
    'BEFORE',
    'THROUGH',
    'COURSE',
    'TEXT',
    'LETTER',
    'CODE',
    'DATA',
    'SYSTEM',
    'NETWORK',
    'CLASSICAL',
    'SHIFT',
    'BLOCK',
    'DECRYPT',
  ],
};
