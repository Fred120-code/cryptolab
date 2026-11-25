import type { VigenereStepData } from '@/algorithms/vigenere';
import type { ExecutionStep, OperationMode } from '@/types';

/**
 * Formate un nombre relatif en remplaçant le signe moins standard par le caractère typographique U+2212.
 *
 * @param n Nombre entier à formater.
 * @returns Représentation textuelle du nombre avec le signe adéquat.
 */
function signed(n: number): string {
  if (n < 0) {
    return `\u2212${Math.abs(n)}`;
  }
  return `${n}`;
}

/**
 * Formate l'explication mathématique d'une étape de l'algorithme de Vigenère sur deux lignes.
 *
 * - Ligne 1 : opération d'addition ou soustraction entre la lettre du message et la lettre de la clé.
 * - Ligne 2 : réduction modulo 26 et déduction de la lettre de résultat.
 *
 * @param step Étape d'exécution de Vigenère.
 * @param mode Mode d'opération cryptographique (chiffrement ou déchiffrement).
 * @returns Objet contenant `line1` et `line2`.
 */
export function formatFormula(
  step: ExecutionStep<VigenereStepData>,
  mode: OperationMode,
): { line1: string; line2: string } {
  const { data } = step;

  let line1: string;
  if (mode === 'encrypt') {
    line1 = `${step.input} (${data.inputValue}) + ${data.keyLetter} (${data.keyValue}) = ${data.rawResult}`;
  } else {
    line1 = `${step.input} (${data.inputValue}) \u2212 ${data.keyLetter} (${data.keyValue}) = ${signed(data.rawResult)}`;
  }

  const line2 = `${signed(data.rawResult)} mod 26 = ${data.outputValue} → ${step.output}`;

  return { line1, line2 };
}
