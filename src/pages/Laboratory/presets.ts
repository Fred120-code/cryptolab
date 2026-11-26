import type { OperationMode } from '@/types';

/**
 * Exemple prédéfini pour le laboratoire de César.
 */
export interface CaesarPreset {
  /** Identifiant unique du preset */
  id: string;
  /** Message d'entrée */
  text: string;
  /** Clé de décalage */
  shift: number;
  /** Mode d'opération */
  mode: OperationMode;
}

/**
 * Exemple prédéfini pour le laboratoire de substitution monoalphabétique.
 */
export interface SubstitutionPreset {
  /** Identifiant unique du preset */
  id: string;
  /** Message d'entrée */
  text: string;
  /** Source de l'alphabet de substitution */
  source: 'keyword' | 'custom';
  /** Mot-clé utilisé lorsque `source === 'keyword'` */
  keyword: string;
  /** Alphabet complet de 26 lettres lorsque `source === 'custom'` */
  alphabet: string;
  /** Mode d'opération */
  mode: OperationMode;
}

/**
 * Exemple prédéfini pour le laboratoire de permutation par blocs.
 */
export interface PermutationPreset {
  /** Identifiant unique du preset */
  id: string;
  /** Message d'entrée */
  text: string;
  /** Permutation sous forme de liste séparée par des virgules */
  permutation: string;
  /** Nombre de caractères de remplissage à retirer au déchiffrement */
  paddingLength: string;
  /** Mode d'opération */
  mode: OperationMode;
}

/**
 * Exemple prédéfini pour le laboratoire de Vigenère.
 */
export interface VigenerePreset {
  /** Identifiant unique du preset */
  id: string;
  /** Message d'entrée */
  text: string;
  /** Clé textuelle */
  key: string;
  /** Mode d'opération */
  mode: OperationMode;
}

/**
 * Exemples prédéfinis pour le laboratoire de César.
 */
export const CAESAR_PRESETS: readonly CaesarPreset[] = [
  { id: 'bonjour3', text: 'BONJOUR', shift: 3, mode: 'encrypt' },
  { id: 'examen7', text: 'EXAMEN', shift: 7, mode: 'encrypt' },
  { id: 'erqmrxu3', text: 'ERQMRXU', shift: 3, mode: 'decrypt' },
  { id: 'lehtlu7', text: 'LEHTLU', shift: 7, mode: 'decrypt' },
];

/**
 * Exemples prédéfinis pour le laboratoire de substitution.
 */
export const SUBSTITUTION_PRESETS: readonly SubstitutionPreset[] = [
  {
    id: 'securiteEncrypt',
    text: 'CRYPTOGRAPHIE',
    source: 'keyword',
    keyword: 'SECURITE',
    alphabet: '',
    mode: 'encrypt',
  },
  {
    id: 'securiteDecrypt',
    text: 'CNYLPKTNSLABR',
    source: 'keyword',
    keyword: 'SECURITE',
    alphabet: '',
    mode: 'decrypt',
  },
  {
    id: 'atbash',
    text: 'BONJOUR',
    source: 'custom',
    keyword: '',
    alphabet: 'ZYXWVUTSRQPONMLKJIHGFEDCBA',
    mode: 'encrypt',
  },
];

/**
 * Exemples prédéfinis pour le laboratoire de permutation.
 */
export const PERMUTATION_PRESETS: readonly PermutationPreset[] = [
  {
    id: 'informatique4',
    text: 'INFORMATIQUE',
    permutation: '2,4,1,3',
    paddingLength: '',
    mode: 'encrypt',
  },
  {
    id: 'securite5',
    text: 'SECURITE',
    permutation: '3,5,1,4,2',
    paddingLength: '',
    mode: 'encrypt',
  },
  {
    id: 'informatique4Decrypt',
    text: 'NOIFMTRAQEIU',
    permutation: '2,4,1,3',
    paddingLength: '',
    mode: 'decrypt',
  },
  {
    id: 'securite5Decrypt',
    text: 'CRSUEEXIXT',
    permutation: '3,5,1,4,2',
    paddingLength: '2',
    mode: 'decrypt',
  },
];

/**
 * Exemples prédéfinis pour le laboratoire de Vigenère.
 */
export const VIGENERE_PRESETS: readonly VigenerePreset[] = [
  { id: 'bonjourCle', text: 'BONJOUR', key: 'CLE', mode: 'encrypt' },
  { id: 'securiteInfo', text: 'SECURITE', key: 'INFO', mode: 'encrypt' },
  { id: 'bonjourCleDecrypt', text: 'DZRLZYT', key: 'CLE', mode: 'decrypt' },
  { id: 'securiteInfoDecrypt', text: 'ARHIZVYS', key: 'INFO', mode: 'decrypt' },
];
