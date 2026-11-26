import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { contrastRatio } from '@/utils/color';

interface ParsedThemeTokens {
  [token: string]: string;
}

function parseTokensCss(): { light: ParsedThemeTokens; dark: ParsedThemeTokens } {
  const filePath = path.resolve(process.cwd(), 'src/styles/tokens.css');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Format strict : exactement deux blocs
  // 1. :root { ... }
  // 2. @media (prefers-color-scheme: dark) { :root { ... } }
  const lightBlockMatch = content.match(/:root\s*\{([^}]+)\}/);
  const darkBlockMatch = content.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]+)\}\s*\}/,
  );

  if (!lightBlockMatch || !darkBlockMatch) {
    throw new Error(
      'Format strict non respecté dans src/styles/tokens.css : blocs :root et @media manquants ou mal formés.',
    );
  }

  const parseBlock = (blockStr: string): ParsedThemeTokens => {
    const lines = blockStr
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const tokens: ParsedThemeTokens = {};

    for (const line of lines) {
      const match = line.match(/^--([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{6});$/);
      if (!match || !match[1] || !match[2]) {
        throw new Error(
          `Ligne non conforme au format strict (--nom: #rrggbb;) dans tokens.css : "${line}"`,
        );
      }
      tokens[match[1]] = match[2].toLowerCase();
    }
    return tokens;
  };

  return {
    light: parseBlock(lightBlockMatch[1] ?? ''),
    dark: parseBlock(darkBlockMatch[1] ?? ''),
  };
}

describe('Design tokens (tokens.css)', () => {
  const { light, dark } = parseTokensCss();

  it('déclare exactement les mêmes jetons dans le thème clair et le thème sombre', () => {
    const lightKeys = Object.keys(light).sort();
    const darkKeys = Object.keys(dark).sort();

    expect(lightKeys).toEqual(darkKeys);
    expect(lightKeys).toEqual([
      'accent',
      'accent-foreground',
      'background',
      'border',
      'card',
      'card-foreground',
      'destructive',
      'foreground',
      'highlight',
      'input',
      'muted',
      'muted-foreground',
      'popover',
      'popover-foreground',
      'primary',
      'primary-foreground',
      'ring',
      'secondary',
      'secondary-foreground',
    ]);
  });

  it('utilise un code hexadécimal à 6 chiffres pour chaque valeur', () => {
    for (const [name, val] of Object.entries(light)) {
      expect(val, `Token clair "${name}" invalide`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    for (const [name, val] of Object.entries(dark)) {
      expect(val, `Token sombre "${name}" invalide`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  const themes: Array<{ name: 'clair' | 'sombre'; tokens: ParsedThemeTokens }> = [
    { name: 'clair', tokens: light },
    { name: 'sombre', tokens: dark },
  ];

  themes.forEach(({ name: themeName, tokens }) => {
    describe(`Vérification des contrastes WCAG AA (${themeName})`, () => {
      const testContrast = (fgKey: string, bgKey: string, minRatio: number): void => {
        const fg = tokens[fgKey]!;
        const bg = tokens[bgKey]!;
        const ratio = contrastRatio(fg, bg);

        expect(
          ratio,
          `Thème ${themeName} : contraste insuffisant pour la paire ${fgKey} (${fg}) sur ${bgKey} (${bg}) : ratio ${ratio.toFixed(2)} < minimum attendu ${minRatio}`,
        ).toBeGreaterThanOrEqual(minRatio);
      };

      it('respecte le contraste texte normal (>= 4.5) pour les paires de base', () => {
        testContrast('foreground', 'background', 4.5);
        testContrast('card-foreground', 'card', 4.5);
        testContrast('popover-foreground', 'popover', 4.5);
        testContrast('primary-foreground', 'primary', 4.5);
        testContrast('secondary-foreground', 'secondary', 4.5);
        testContrast('muted-foreground', 'background', 4.5);
        testContrast('muted-foreground', 'card', 4.5);
        testContrast('muted-foreground', 'muted', 4.5);
        testContrast('accent-foreground', 'accent', 4.5);
        testContrast('foreground', 'muted', 4.5);
      });

      it('respecte le contraste (>= 4.5) pour highlight utilisé comme texte', () => {
        testContrast('highlight', 'background', 4.5);
        testContrast('highlight', 'card', 4.5);
        testContrast('highlight', 'muted', 4.5);
      });

      it('respecte le contraste (>= 3.0) pour highlight sur card', () => {
        testContrast('highlight', 'card', 3.0);
      });

      it('respecte le contraste (>= 4.5) pour destructive utilisé comme texte', () => {
        testContrast('destructive', 'background', 4.5);
        testContrast('destructive', 'card', 4.5);
        testContrast('destructive', 'muted', 4.5);
      });

      it('respecte le contraste indicateur de focus (>= 3.0) pour ring', () => {
        testContrast('ring', 'background', 3.0);
        testContrast('ring', 'card', 3.0);
      });
    });
  });
});
