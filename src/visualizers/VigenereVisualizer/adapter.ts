import type { CaesarStepData } from '@/algorithms/caesar';
import type { VigenereStepData } from '@/algorithms/vigenere';
import type { ExecutionStep } from '@/types';

/**
 * Adapte une étape d'exécution de l'algorithme de Vigenère en une étape d'exécution
 * compatible avec le cadran circulaire de César (`CaesarDial`).
 *
 * @param step Étape d'exécution de Vigenère.
 * @returns Étape d'exécution au format attendu par César.
 */
export function toDialStep(step: ExecutionStep<VigenereStepData>): ExecutionStep<CaesarStepData> {
  return {
    ...step,
    data: {
      position: step.data.position,
      inputIndex: step.data.inputValue,
      outputIndex: step.data.outputValue,
      shift: step.data.keyValue,
      rawShift: step.data.keyValue,
      wrapped: step.data.wrapped,
      isUpper: step.data.isUpper,
    },
  };
}
