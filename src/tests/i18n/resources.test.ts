import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import i18n from '@/i18n';
import { usePlayerLabels } from '@/hooks/usePlayerLabels';
import { caesarAlgorithm } from '@/algorithms/caesar';
import { substitutionAlgorithm } from '@/algorithms/substitution';
import { permutationAlgorithm, validateCiphertext } from '@/algorithms/permutation';
import { vigenereAlgorithm } from '@/algorithms/vigenere';
import type { TranslatableText } from '@/types';

import commonFr from '@/i18n/fr/common.json';
import playerFr from '@/i18n/fr/player.json';
import caesarFr from '@/i18n/fr/caesar.json';
import substitutionFr from '@/i18n/fr/substitution.json';
import permutationFr from '@/i18n/fr/permutation.json';
import vigenereFr from '@/i18n/fr/vigenere.json';

import commonEn from '@/i18n/en/common.json';
import playerEn from '@/i18n/en/player.json';
import caesarEn from '@/i18n/en/caesar.json';
import substitutionEn from '@/i18n/en/substitution.json';
import permutationEn from '@/i18n/en/permutation.json';
import vigenereEn from '@/i18n/en/vigenere.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, fullKey));
    } else if (typeof value === 'string') {
      result[fullKey] = value;
    }
  }
  return result;
}

function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((m) => m.slice(2, -2).trim()).sort();
}

describe('i18n resources integrity', () => {
  const allFr = {
    ...commonFr,
    ...playerFr,
    ...caesarFr,
    ...substitutionFr,
    ...permutationFr,
    ...vigenereFr,
  };

  const allEn = {
    ...commonEn,
    ...playerEn,
    ...caesarEn,
    ...substitutionEn,
    ...permutationEn,
    ...vigenereEn,
  };

  const flatFr = flattenKeys(allFr);
  const flatEn = flattenKeys(allEn);

  it('possède des ensembles de clés identiques entre fr et en', () => {
    const keysFr = Object.keys(flatFr).sort();
    const keysEn = Object.keys(flatEn).sort();

    expect(keysFr).toEqual(keysEn);
  });

  it('ne contient aucune valeur vide dans les traductions fr et en', () => {
    for (const [key, value] of Object.entries(flatFr)) {
      expect(value.trim(), `Valeur vide en FR pour la clé "${key}"`).not.toBe('');
    }
    for (const [key, value] of Object.entries(flatEn)) {
      expect(value.trim(), `Valeur vide en EN pour la clé "${key}"`).not.toBe('');
    }
  });

  it('possède exactement les mêmes variables {{...}} pour chaque clé en fr et en', () => {
    for (const key of Object.keys(flatFr)) {
      const placeholdersFr = extractPlaceholders(flatFr[key]!);
      const placeholdersEn = extractPlaceholders(flatEn[key]!);

      expect(
        placeholdersFr,
        `Différence de placeholders pour "${key}": FR=[${placeholdersFr.join(', ')}] vs EN=[${placeholdersEn.join(', ')}]`,
      ).toEqual(placeholdersEn);
    }
  });
});

describe('Engine coverage test for i18n keys', () => {
  const collectedTexts: TranslatableText[] = [];

  // César
  const caesarEnc = caesarAlgorithm.getSteps('HELLO', { shift: 3 }, 'encrypt');
  caesarEnc.steps.forEach((s) => collectedTexts.push(s.explanation));
  const caesarDec = caesarAlgorithm.getSteps('KHOOR', { shift: 3 }, 'decrypt');
  caesarDec.steps.forEach((s) => collectedTexts.push(s.explanation));
  const caesarVal = caesarAlgorithm.validate({ shift: NaN });
  if (!caesarVal.valid) collectedTexts.push(...caesarVal.errors);

  // Substitution
  const subAlphabet = 'BCDEFGHIJKLMNOPQRSTUVWXYZA';
  const subEnc = substitutionAlgorithm.getSteps('HELLO', { alphabet: subAlphabet }, 'encrypt');
  subEnc.steps.forEach((s) => collectedTexts.push(s.explanation));
  const subDec = substitutionAlgorithm.getSteps('IFMMP', { alphabet: subAlphabet }, 'decrypt');
  subDec.steps.forEach((s) => collectedTexts.push(s.explanation));
  const subVal = substitutionAlgorithm.validate({ alphabet: 'ABCDE11GHIJKLMNOPQRSTUVW' });
  if (!subVal.valid) collectedTexts.push(...subVal.errors);

  // Permutation
  const permPattern = [2, 1];
  const permEnc = permutationAlgorithm.getSteps(
    'HE',
    { permutation: permPattern, paddingLength: 0 },
    'encrypt',
  );
  permEnc.steps.forEach((s) => collectedTexts.push(s.explanation));
  const permDec = permutationAlgorithm.getSteps(
    'EH',
    { permutation: permPattern, paddingLength: 0 },
    'decrypt',
  );
  permDec.steps.forEach((s) => collectedTexts.push(s.explanation));

  const permVal1 = permutationAlgorithm.validate({ permutation: [1, 1, 3] });
  if (!permVal1.valid) collectedTexts.push(...permVal1.errors);
  const permVal2 = permutationAlgorithm.validate({ permutation: [0, 2, 5] });
  if (!permVal2.valid) collectedTexts.push(...permVal2.errors);
  const permVal3 = permutationAlgorithm.validate({ permutation: [1.5, 2, 3] });
  if (!permVal3.valid) collectedTexts.push(...permVal3.errors);
  const permVal4 = permutationAlgorithm.validate({ permutation: [1] });
  if (!permVal4.valid) collectedTexts.push(...permVal4.errors);
  const permVal5 = permutationAlgorithm.validate({ permutation: [2, 1], paddingLength: 5 });
  if (!permVal5.valid) collectedTexts.push(...permVal5.errors);

  const permCipherVal = validateCiphertext('ABC', { permutation: [2, 1] });
  if (!permCipherVal.valid) collectedTexts.push(...permCipherVal.errors);

  // Vigenère
  const vigEnc = vigenereAlgorithm.getSteps('HELLO', { key: 'KEY' }, 'encrypt');
  vigEnc.steps.forEach((s) => collectedTexts.push(s.explanation));
  const vigDec = vigenereAlgorithm.getSteps('RIJVS', { key: 'KEY' }, 'decrypt');
  vigDec.steps.forEach((s) => collectedTexts.push(s.explanation));
  const vigVal1 = vigenereAlgorithm.validate({ key: '' });
  if (!vigVal1.valid) collectedTexts.push(...vigVal1.errors);
  const vigVal2 = vigenereAlgorithm.validate({ key: 'CL3' });
  if (!vigVal2.valid) collectedTexts.push(...vigVal2.errors);

  it('vérifie que toutes les clés du moteur existent en FR et en EN et interpolent sans reste', () => {
    expect(collectedTexts.length).toBeGreaterThan(0);

    for (const item of collectedTexts) {
      expect(i18n.exists(item.key, { lng: 'fr' }), `Clé manquante en FR : "${item.key}"`).toBe(
        true,
      );
      expect(i18n.exists(item.key, { lng: 'en' }), `Clé manquante en EN : "${item.key}"`).toBe(
        true,
      );

      const frTranslation = i18n.t(item.key, { lng: 'fr', ...(item.params || {}) });
      expect(
        frTranslation,
        `Placeholder non résolu en FR pour "${item.key}" : ${frTranslation}`,
      ).not.toContain('{{');

      const enTranslation = i18n.t(item.key, { lng: 'en', ...(item.params || {}) });
      expect(
        enTranslation,
        `Placeholder non résolu en EN pour "${item.key}" : ${enTranslation}`,
      ).not.toContain('{{');
    }
  });
});

describe('usePlayerLabels', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  afterEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('retourne des libellés traduits distincts en FR et en EN, recalcule via t et formate speedOption selon la locale', async () => {
    const { result } = renderHook(() => usePlayerLabels());

    expect(result.current.restart).toBe('Recommencer');
    expect(result.current.previous).toBe('Étape précédente');
    expect(result.current.play).toBe('Lecture');
    expect(result.current.pause).toBe('Pause');
    expect(result.current.next).toBe('Étape suivante');
    expect(result.current.speed).toBe('Vitesse de lecture');
    expect(result.current.progress).toBe('Accéder à une étape');
    expect(result.current.stepOf(3, 12)).toBe('Étape 3 / 12');
    expect(result.current.speedOption(0.5)).toBe('0,5×');
    expect(result.current.speedOption(1)).toBe('1×');

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    expect(result.current.restart).toBe('Restart');
    expect(result.current.previous).toBe('Previous step');
    expect(result.current.play).toBe('Play');
    expect(result.current.pause).toBe('Pause');
    expect(result.current.next).toBe('Next step');
    expect(result.current.speed).toBe('Playback speed');
    expect(result.current.progress).toBe('Go to step');
    expect(result.current.stepOf(3, 12)).toBe('Step 3 / 12');
    expect(result.current.speedOption(0.5)).toBe('0.5×');
    expect(result.current.speedOption(1)).toBe('1×');

    await act(async () => {
      await i18n.changeLanguage('fr');
    });

    expect(result.current.restart).toBe('Recommencer');
    expect(result.current.speedOption(0.5)).toBe('0,5×');
  });
});
