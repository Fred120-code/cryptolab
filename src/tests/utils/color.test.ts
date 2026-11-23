import { describe, it, expect } from 'vitest';
import { hexToRgb, relativeLuminance, contrastRatio } from '@/utils/color';

describe('color utils', () => {
  describe('hexToRgb', () => {
    it('convertit un code hexadécimal 6 caractères avec dièse', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#7c3aed')).toEqual({ r: 124, g: 58, b: 237 });
    });

    it('convertit un code hexadécimal sans dièse', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('lève une erreur en cas de format hexadécimal invalide', () => {
      expect(() => hexToRgb('#fff')).toThrow('Code hexadécimal invalide');
      expect(() => hexToRgb('xyz123')).toThrow('Code hexadécimal invalide');
      expect(() => hexToRgb('#1234567')).toThrow('Code hexadécimal invalide');
      expect(() => hexToRgb('')).toThrow('Code hexadécimal invalide');
    });
  });

  describe('relativeLuminance', () => {
    it('calcule la luminance relative des extrêmes', () => {
      expect(relativeLuminance(0, 0, 0)).toBe(0);
      expect(relativeLuminance(255, 255, 255)).toBe(1);
    });
  });

  describe('contrastRatio', () => {
    it('retourne 21 pour noir sur blanc', () => {
      expect(contrastRatio('#000000', '#ffffff')).toBe(21);
      expect(contrastRatio('#ffffff', '#000000')).toBe(21);
    });

    it('mesure environ 4.54 pour #767676 sur blanc et 4.48 pour #777777 sur blanc (tolérance 0.01)', () => {
      expect(Math.abs(contrastRatio('#767676', '#ffffff') - 4.54)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(contrastRatio('#777777', '#ffffff') - 4.48)).toBeLessThanOrEqual(0.01);
    });

    it('retourne 1 pour des couleurs identiques', () => {
      expect(contrastRatio('#7c3aed', '#7c3aed')).toBe(1);
      expect(contrastRatio('#fafafa', '#fafafa')).toBe(1);
    });
  });
});
