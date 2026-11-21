import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import i18n from '@/i18n';

describe('i18n configuration', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('fr');
  });

  afterEach(async () => {
    await i18n.changeLanguage('fr');
    localStorage.clear();
  });

  it('met à jour document.documentElement.lang et persiste dans localStorage lors du changement de langue', async () => {
    expect(document.documentElement.lang).toBe('fr');

    await i18n.changeLanguage('en');

    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('cryptolab:language')).toBe('en');
  });

  it("n'échappe pas les caractères & et < dans les valeurs de paramètres interpolées", () => {
    i18n.addResource('fr', 'translation', 'test.interpolation', 'Valeur: {{val}}');

    const result = i18n.t('test.interpolation', { val: '<b>Tom & Jerry</b>' });
    expect(result).toBe('Valeur: <b>Tom & Jerry</b>');
  });

  it('initialise correctement la clé commune common.language', () => {
    expect(i18n.t('common.language', { lng: 'fr' })).toBe('Langue');
    expect(i18n.t('common.language', { lng: 'en' })).toBe('Language');
  });
});
