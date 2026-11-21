import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectLanguage,
  persistLanguage,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@/i18n/language';

describe('language', () => {
  const originalLanguage = navigator.language;

  const setNavigatorLanguage = (lang: string): void => {
    Object.defineProperty(navigator, 'language', {
      value: lang,
      configurable: true,
      writable: true,
    });
  };

  beforeEach(() => {
    localStorage.clear();
    setNavigatorLanguage('fr-FR');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setNavigatorLanguage(originalLanguage);
    localStorage.clear();
  });

  describe('isSupportedLanguage', () => {
    it('reconnaît les langues supportées', () => {
      expect(isSupportedLanguage('fr')).toBe(true);
      expect(isSupportedLanguage('en')).toBe(true);
    });

    it('rejette les langues non supportées et les types invalides', () => {
      expect(isSupportedLanguage('es')).toBe(false);
      expect(isSupportedLanguage('de')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
      expect(isSupportedLanguage(null)).toBe(false);
      expect(isSupportedLanguage(undefined)).toBe(false);
      expect(isSupportedLanguage(123)).toBe(false);
    });

    it('contient exactement fr et en dans SUPPORTED_LANGUAGES', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['fr', 'en']);
    });
  });

  describe('detectLanguage', () => {
    it('donne la priorité à la valeur valide stockée dans localStorage', () => {
      localStorage.setItem('cryptolab:language', 'en');
      setNavigatorLanguage('fr-FR');

      expect(detectLanguage()).toBe('en');
    });

    it('ignore une valeur stockée non supportée et retombe sur la suite', () => {
      localStorage.setItem('cryptolab:language', 'es');
      setNavigatorLanguage('en-US');

      expect(detectLanguage()).toBe('en');
    });

    it("détecte 'fr' lorsque navigator.language est 'fr-CM'", () => {
      setNavigatorLanguage('fr-CM');
      expect(detectLanguage()).toBe('fr');
    });

    it("détecte 'en' lorsque navigator.language est 'en-US'", () => {
      setNavigatorLanguage('en-US');
      expect(detectLanguage()).toBe('en');
    });

    it("retombe sur 'fr' par défaut lorsque la langue du navigateur est 'de'", () => {
      setNavigatorLanguage('de');
      expect(detectLanguage()).toBe('fr');
    });

    it('ne plante pas si localStorage.getItem lève une exception', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      setNavigatorLanguage('en-GB');

      expect(() => detectLanguage()).not.toThrow();
      expect(detectLanguage()).toBe('en');
    });
  });

  describe('persistLanguage', () => {
    it('enregistre la langue dans localStorage sous la clé dédiée', () => {
      persistLanguage('en');
      expect(localStorage.getItem('cryptolab:language')).toBe('en');
    });

    it('échoue silencieusement si localStorage.setItem lève une exception', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => persistLanguage('fr')).not.toThrow();
    });
  });
});
