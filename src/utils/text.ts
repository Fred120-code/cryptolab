/**
 * Normalise un texte brut en vue d'un traitement cryptographique strict :
 * - Décompose les caractères accentués en forme NFD.
 * - Supprime les diacritiques (marques combinantes Unicode).
 * - Ne conserve que les lettres de l'alphabet latin ASCII (A-Z / a-z).
 * - Convertit l'ensemble en lettres majuscules.
 * - Supprime tout le reste (espaces, ponctuation, chiffres, symboles, emojis, ligatures non décomposables en ASCII).
 *
 * @param text Chaîne de texte brute en entrée.
 * @returns Chaîne contenant uniquement les lettres ASCII majuscules.
 * @example
 * normalizeLetters("Élève, ok!") // "ELEVEOK"
 */
export function normalizeLetters(text: string): string {
  // Décomposition NFD pour séparer lettres et accents (ex: "é" -> "e" + "\u0301")
  const decomposed = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let result = '';
  for (const char of decomposed) {
    const code = char.charCodeAt(0);
    // 'A'-'Z' (65-90) ou 'a'-'z' (97-122)
    if (code >= 65 && code <= 90) {
      result += char;
    } else if (code >= 97 && code <= 122) {
      result += char.toUpperCase();
    }
  }

  return result;
}
