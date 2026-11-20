/**
 * Taille de l'alphabet latin usuel (A-Z).
 */
export const ALPHABET_SIZE = 26;

/**
 * Calcule un modulo mathématique toujours positif, quel que soit le signe de n.
 *
 * En JavaScript, l'opérateur `%` retourne un reste qui conserve le signe de l'opérande gauche
 * (-3 % 26 = -3). Cette fonction garantit un résultat strictement dans l'intervalle [0, m - 1].
 *
 * @param n Nombre entier à diviser.
 * @param m Modulo (doit être un entier strictement positif).
 * @returns Le reste modulo m, toujours compris entre 0 et m - 1.
 * @example
 * mod(-3, 26) // returns 23
 * mod(29, 26) // returns 3
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Vérifie si un caractère est une lettre majuscule ASCII standard ('A' à 'Z').
 *
 * @param char Caractère ou chaîne de longueur 1 à tester.
 * @returns `true` si le caractère est dans l'intervalle ['A'..'Z'], `false` sinon.
 */
export function isUpperLetter(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 65 && code <= 90; // 'A'..'Z'
}

/**
 * Vérifie si un caractère est une lettre minuscule ASCII standard ('a' à 'z').
 *
 * @param char Caractère ou chaîne de longueur 1 à tester.
 * @returns `true` si le caractère est dans l'intervalle ['a'..'z'], `false` sinon.
 */
export function isLowerLetter(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 97 && code <= 122; // 'a'..'z'
}

/**
 * Vérifie si un caractère est une lettre de l'alphabet ASCII standard (majuscule ou minuscule).
 *
 * @param char Caractère ou chaîne de longueur 1 à tester.
 * @returns `true` s'il s'agit d'une lettre ASCII, `false` sinon.
 */
export function isLetter(char: string): boolean {
  return isUpperLetter(char) || isLowerLetter(char);
}

/**
 * Convertit une lettre de l'alphabet latin ASCII en son index numérique (0 à 25).
 * La conversion est insensible à la casse ('A' ou 'a' renvoie 0).
 *
 * @param char Lettre ASCII à convertir ('A'-'Z' ou 'a'-'z').
 * @returns L'index correspondant de 0 à 25.
 * @throws {Error} Si le caractère fourni n'est pas une lettre ASCII.
 */
export function letterToIndex(char: string): number {
  if (isUpperLetter(char)) {
    return char.charCodeAt(0) - 65;
  }
  if (isLowerLetter(char)) {
    return char.charCodeAt(0) - 97;
  }
  throw new Error(`Invalid ASCII letter: '${char}'`);
}

/**
 * Convertit un index numérique (0 à 25) en la lettre correspondante de l'alphabet.
 *
 * @param index Index compris entre 0 et 25 (ou modulé par 26).
 * @param upper Si `true`, retourne la lettre en majuscule, sinon en minuscule.
 * @returns Le caractère correspondant ('A'..'Z' ou 'a'..'z').
 */
export function indexToLetter(index: number, upper: boolean): string {
  const normalizedIndex = mod(index, ALPHABET_SIZE);
  const baseCharCode = upper ? 65 : 97;
  return String.fromCharCode(baseCharCode + normalizedIndex);
}
