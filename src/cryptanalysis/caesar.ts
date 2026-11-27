import { caesarAlgorithm } from '@/algorithms';
import { normalizeLetters } from '@/utils/text';
import type { AnalysisLanguage, LanguageChoice } from './languages';
import { bestScore } from './scoring';

/**
 * Seuil heuristique minimal de lettres pour juger une analyse statistique fiable sans forte couverture lexicale.
 */
export const MIN_RELIABLE_LETTERS = 20;

/**
 * Écart minimal heuristique entre les deux meilleurs scores pour conclure avec confiance.
 */
export const MIN_MARGIN = 0.3;

/**
 * Couverture lexicale minimale heuristique permettant de conclure sur un message court.
 */
export const MIN_COVERAGE_FOR_SHORT = 0.8;

/**
 * Hypothèse de déchiffrement de César pour un décalage donné.
 */
export interface CaesarCandidate {
  /** Décalage testé (0 à 25) */
  shift: number;
  /** Texte obtenu après déchiffrement */
  text: string;
  /** Langue ayant obtenu le meilleur score pour ce candidat */
  language: AnalysisLanguage;
  /** Score combiné de plausibilité */
  score: number;
  /** Proportion de lettres couvertes par des mots courants (0 à 1) */
  coverage: number;
  /** Indice de lisibilité normalisé entre 0 et 100 sur les 26 candidats */
  readability: number;
  /** Rang dans le classement (1 = meilleur) */
  rank: number;
}

/**
 * Résultat complet d'une attaque par force brute sur le chiffre de César.
 */
export interface CaesarAnalysis {
  /** Nombre de lettres alphabétiques analysées */
  letterCount: number;
  /** Les 26 candidats ordonnés par décalage croissant (0 à 25) */
  candidates: CaesarCandidate[];
  /** Décalages classés du meilleur score au moins bon */
  ranking: number[];
  /** Écart de score entre le premier et le deuxième du classement */
  margin: number;
  /** Niveau de confiance heuristique (`'enough'` ou `'limited'`) */
  confidence: 'enough' | 'limited';
}

/**
 * Teste les 26 décalages possibles du chiffre de César et classe les candidats par lisibilité.
 *
 * Les seuils de confiance (`MIN_RELIABLE_LETTERS`, `MIN_MARGIN`, `MIN_COVERAGE_FOR_SHORT`)
 * sont heuristiques : sur des messages très courts ou ambigus, l'indice reste `'limited'`.
 *
 * @param ciphertext Cryptogramme à analyser.
 * @param choice Langue attendue ou `'auto'` pour la détection automatique.
 * @returns Analyse complète avec les 26 candidats, leur classement et le niveau de confiance.
 */
export function bruteForceCaesar(ciphertext: string, choice: LanguageChoice): CaesarAnalysis {
  const letterCount = normalizeLetters(ciphertext).length;
  if (letterCount === 0) {
    return {
      letterCount: 0,
      candidates: [],
      ranking: [],
      margin: 0,
      confidence: 'limited',
    };
  }

  const raw: {
    shift: number;
    text: string;
    language: AnalysisLanguage;
    score: number;
    coverage: number;
  }[] = [];

  for (let shift = 0; shift < 26; shift++) {
    const text = caesarAlgorithm.decrypt(ciphertext, { shift });
    const scored = bestScore(text, choice);
    raw.push({
      shift,
      text,
      language: scored.language,
      score: scored.score,
      coverage: scored.coverage,
    });
  }

  const ranking = raw
    .map((c) => c.shift)
    .sort((a, b) => {
      const diff = raw[b]!.score - raw[a]!.score;
      return diff !== 0 ? diff : a - b;
    });

  const ranks = new Array<number>(26);
  ranking.forEach((shift, idx) => {
    ranks[shift] = idx + 1;
  });

  let minScore = Infinity;
  let maxScore = -Infinity;
  for (const c of raw) {
    if (c.score < minScore) minScore = c.score;
    if (c.score > maxScore) maxScore = c.score;
  }
  const span = maxScore - minScore;

  const candidates: CaesarCandidate[] = raw.map((c) => ({
    shift: c.shift,
    text: c.text,
    language: c.language,
    score: c.score,
    coverage: c.coverage,
    readability: span === 0 ? 0 : Math.round((100 * (c.score - minScore)) / span),
    rank: ranks[c.shift]!,
  }));

  const first = candidates[ranking[0]!]!;
  const second = candidates[ranking[1]!]!;
  const margin = first.score - second.score;
  const confidence: 'enough' | 'limited' =
    margin >= MIN_MARGIN &&
    (letterCount >= MIN_RELIABLE_LETTERS || first.coverage >= MIN_COVERAGE_FOR_SHORT)
      ? 'enough'
      : 'limited';

  return {
    letterCount,
    candidates,
    ranking,
    margin,
    confidence,
  };
}
