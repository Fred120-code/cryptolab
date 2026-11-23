/**
 * Composantes RGB d'une couleur.
 */
export interface RgbColor {
  /** Canal rouge (0 - 255) */
  r: number;
  /** Canal vert (0 - 255) */
  g: number;
  /** Canal bleu (0 - 255) */
  b: number;
}

/**
 * Convertit un code couleur hexadécimal (#rrggbb ou rrggbb) en composantes RGB.
 *
 * @param hex - Code hexadécimal à 6 chiffres.
 * @returns Objet avec les composantes r, g, b entières.
 * @throws {Error} Si le format de la couleur hexadécimale est invalide.
 */
export function hexToRgb(hex: string): RgbColor {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Code hexadécimal invalide : "${hex}". Format attendu : #rrggbb.`);
  }

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * Calcule la luminance relative d'une couleur RGB selon la formule WCAG 2.x.
 *
 * @param r - Canal rouge (0 - 255).
 * @param g - Canal vert (0 - 255).
 * @param b - Canal bleu (0 - 255).
 * @returns Luminance relative comprise entre 0 (noir le plus sombre) et 1 (blanc le plus lumineux).
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

/**
 * Calcule le ratio de contraste entre deux couleurs selon l'algorithme WCAG 2.x.
 *
 * Formule : (L1 + 0.05) / (L2 + 0.05) où L1 >= L2.
 *
 * @param color1 - Première couleur au format hexadécimal.
 * @param color2 - Seconde couleur au format hexadécimal.
 * @returns Ratio de contraste entre 1.0 et 21.0.
 */
export function contrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}
