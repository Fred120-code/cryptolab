/**
 * Pas angulaire en degrés entre deux lettres consécutives dans un alphabet de 26 lettres.
 */
export const ALPHABET_SIZE_DEG_STEP = 360 / 26;

/**
 * Coordonnées cartésiennes 2D d'un point.
 */
export interface Point2D {
  /** Abscisse X */
  x: number;
  /** Ordonnée Y */
  y: number;
}

/**
 * Calcule l'angle en degrés pour une lettre donnée selon son index (0 à 25).
 * La lettre 'A' (index 0) est positionnée au sommet à -90°, et les lettres
 * se succèdent dans le sens des aiguilles d'une montre.
 *
 * @param index - Index alphabétique de la lettre (0 = A, 1 = B, ..., 25 = Z).
 * @returns Angle en degrés.
 */
export function angleForIndex(index: number): number {
  return -90 + index * ALPHABET_SIZE_DEG_STEP;
}

/**
 * Convertit des coordonnées polaires en coordonnées cartésiennes cartésiennes 2D.
 *
 * @param cx - Abscisse du centre du cercle.
 * @param cy - Ordonnée du centre du cercle.
 * @param r - Rayon du cercle.
 * @param angleDeg - Angle en degrés.
 * @returns Coordonnées { x, y } correspondantes.
 */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Génère le tracé SVG (attribut `d`) d'un arc de cercle entre deux angles donnés.
 *
 * Gère automatiquement les indicateurs large-arc et sweep pour supporter
 * les arcs parcourus dans les deux sens (horaire et anti-horaire).
 * Retourne une chaîne vide si l'arc est de longueur nulle.
 *
 * @param cx - Abscisse du centre du cercle.
 * @param cy - Ordonnée du centre du cercle.
 * @param r - Rayon de l'arc.
 * @param startAngleDeg - Angle initial en degrés.
 * @param endAngleDeg - Angle final en degrés.
 * @returns Chaîne SVG formatée pour l'attribut `d`, ou chaîne vide si longueur nulle.
 */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const delta = endAngleDeg - startAngleDeg;
  if (Math.abs(delta) < 1e-6) {
    return '';
  }

  const p1 = polarToCartesian(cx, cy, r, startAngleDeg);
  const p2 = polarToCartesian(cx, cy, r, endAngleDeg);
  const largeArc = Math.abs(delta) > 180 ? 1 : 0;
  const sweep = delta > 0 ? 1 : 0;

  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${p2.x} ${p2.y}`;
}
