import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import i18n from '@/i18n';
import { useTranslatableText } from '@/hooks/useTranslatableText';

describe('useTranslatableText', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('traduit un TranslatableText avec clé existante', () => {
    const { result } = renderHook(() => useTranslatableText());
    const tt = result.current;

    expect(tt({ key: 'common.language' })).toBe('Langue');
  });

  it('interpole les paramètres fournis', () => {
    i18n.addResource('fr', 'translation', 'test.greeting', 'Bonjour {{name}}');

    const { result } = renderHook(() => useTranslatableText());
    const tt = result.current;

    expect(tt({ key: 'test.greeting', params: { name: 'Alice' } })).toBe('Bonjour Alice');
  });

  it('retourne la clé telle quelle si elle est absente', () => {
    const { result } = renderHook(() => useTranslatableText());
    const tt = result.current;

    expect(tt({ key: 'unknown.key' })).toBe('unknown.key');
  });
});
