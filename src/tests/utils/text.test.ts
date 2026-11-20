import { describe, expect, it } from 'vitest';
import { normalizeLetters } from '@/utils/text';

describe('normalizeLetters', () => {
  it('supprime les accents et convertit en majuscules', () => {
    expect(normalizeLetters('Élève, ok!')).toBe('ELEVEOK');
    expect(normalizeLetters('àâä éèêë îï ôö ùûü ç')).toBe('AAAEEEEIIOOUUUC');
  });

  it('supprime les espaces, chiffres, ponctuations et symboles', () => {
    expect(normalizeLetters('Hello, World! 123 @#%')).toBe('HELLOWORLD');
  });

  it('gère une chaîne vide', () => {
    expect(normalizeLetters('')).toBe('');
    expect(normalizeLetters('   12345 !? ')).toBe('');
  });

  it('supprime les emojis et ligatures non décomposables en ASCII', () => {
    // Les ligatures comme œ / Œ ne se décomposent pas en oe via NFD
    expect(normalizeLetters('cœur')).toBe('CUR');
    expect(normalizeLetters('Hello 👋 World 🌍')).toBe('HELLOWORLD');
  });
});
