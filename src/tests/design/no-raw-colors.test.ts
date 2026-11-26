import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function findTsxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Exclure src/components/ui/ (composants générés shadcn)
      if (fullPath.includes(path.join('src', 'components', 'ui'))) {
        continue;
      }
      files.push(...findTsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Règle d interdiction des couleurs brutes et préfixes dark:', () => {
  const root = process.cwd();
  const targetFiles: string[] = [
    ...findTsxFiles(path.join(root, 'src', 'components')),
    ...findTsxFiles(path.join(root, 'src', 'pages')),
    ...findTsxFiles(path.join(root, 'src', 'visualizers')),
  ];

  const appFile = path.join(root, 'src', 'App.tsx');
  if (fs.existsSync(appFile)) {
    targetFiles.push(appFile);
  }

  // Motifs interdits :
  // 1. Classes de la palette Tailwind : bg-zinc-500, text-gray-700, border-neutral-200, etc.
  const rawTailwindColorPattern =
    /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-[0-9]{2,3}(?:\/[0-9]+)?)?\b/;

  // 2. Code couleur hexadécimal brut
  const rawHexPattern = /#[0-9a-fA-F]{3,8}\b/;

  // 3. Préfixe dark: (le thème sombre est géré automatiquement via @media prefers-color-scheme)
  const darkPrefixPattern = /\bdark:/;

  // 4. Classe text-primary seule (pas text-primary-foreground)
  const textPrimaryPattern = /\btext-primary(?!-)\b/;

  it('ne contient aucune couleur brute ni préfixe dark: dans les composants applicatifs', () => {
    const violations: string[] = [];

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(root, file);

      const tailwindMatch = content.match(rawTailwindColorPattern);
      if (tailwindMatch) {
        violations.push(
          `Fichier "${relPath}" contient une classe de couleur Tailwind brute : "${tailwindMatch[0]}"`,
        );
      }

      const hexMatch = content.match(rawHexPattern);
      if (hexMatch) {
        violations.push(
          `Fichier "${relPath}" contient un code hexadécimal brut : "${hexMatch[0]}"`,
        );
      }

      const darkMatch = content.match(darkPrefixPattern);
      if (darkMatch) {
        violations.push(
          `Fichier "${relPath}" contient le préfixe "dark:" interdit (utilisez les jetons sémantiques) : "${darkMatch[0]}"`,
        );
      }

      const textPrimaryMatch = content.match(textPrimaryPattern);
      if (textPrimaryMatch) {
        violations.push(
          `Fichier "${relPath}" contient la classe interdite "${textPrimaryMatch[0]}" (utilisez text-highlight)`,
        );
      }
    }

    expect(
      violations,
      `Des couleurs brutes ou préfixes dark: ont été détectés :\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
