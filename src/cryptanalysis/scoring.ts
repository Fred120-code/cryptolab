import { normalizeLetters } from '@/utils/text';
import {
  COMMON_WORDS,
  LETTER_FREQUENCIES,
  type AnalysisLanguage,
  type LanguageChoice,
} from './languages';

/**
 * Pondération appliquée à la couverture lexicale dans le calcul du score global.
 */
export const COVERAGE_WEIGHT = 2;

/**
 * Résultat d'évaluation statistique et lexicale d'un texte pour une langue donnée.
 */
export interface TextScore {
  /** Langue évaluée */
  language: AnalysisLanguage;
  /** Log-vraisemblance moyenne par lettre selon les fréquences de la langue */
  logLikelihood: number;
  /** Proportion de lettres (entre 0 et 1) couvertes par des mots courants */
  coverage: number;
  /** Score combiné (`logLikelihood + COVERAGE_WEIGHT * coverage`) */
  score: number;
}

/**
 * Évalue la plausibilité d'un texte dans une langue donnée à partir de la fréquence
 * des lettres et de la présence de mots courants.
 *
 * @param text Texte candidat à évaluer.
 * @param language Langue cible (`'fr'` ou `'en'`).
 * @returns Détail du score calculé.
 */
export function scoreText(text: string, language: AnalysisLanguage): TextScore {
  const letters = normalizeLetters(text);
  if (letters.length === 0) {
    return {
      language,
      logLikelihood: -10,
      coverage: 0,
      score: -10,
    };
  }

  const freqs = LETTER_FREQUENCIES[language];
  let logSum = 0;
  for (let i = 0; i < letters.length; i++) {
    const idx = letters.charCodeAt(i) - 65;
    const freq = freqs[idx] ?? 0;
    logSum += Math.log(freq / 100);
  }
  const logLikelihood = logSum / letters.length;

  const covered = new Uint8Array(letters.length);
  const words = COMMON_WORDS[language];
  for (const word of words) {
    let pos = letters.indexOf(word);
    while (pos !== -1) {
      for (let j = pos; j < pos + word.length; j++) {
        covered[j] = 1;
      }
      pos = letters.indexOf(word, pos + 1);
    }
  }

  let coveredCount = 0;
  for (let i = 0; i < covered.length; i++) {
    if (covered[i] === 1) {
      coveredCount++;
    }
  }
  const coverage = coveredCount / letters.length;
  const score = logLikelihood + COVERAGE_WEIGHT * coverage;

  return {
    language,
    logLikelihood,
    coverage,
    score,
  };
}

/**
 * Retourne le meilleur score d'un texte selon le choix de langue (`'auto'`, `'fr'` ou `'en'`).
 * En mode `'auto'`, évalue les deux langues et départage les égalités en faveur du français.
 *
 * @param text Texte candidat à évaluer.
 * @param choice Choix de langue ou détection automatique.
 * @returns Score retenu.
 */
export function bestScore(text: string, choice: LanguageChoice): TextScore {
  if (choice === 'auto') {
    const frScore = scoreText(text, 'fr');
    const enScore = scoreText(text, 'en');
    return enScore.score > frScore.score ? enScore : frScore;
  }
  return scoreText(text, choice);
}
