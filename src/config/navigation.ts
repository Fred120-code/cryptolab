import { ROUTES } from './routes';

/**
 * Définition d'un élément de navigation de premier niveau.
 */
export interface NavItem {
  /** Chemin URL de destination */
  path: string;
  /** Clé de traduction du libellé */
  labelKey: string;
  /** Indique si la correspondance de route doit être exacte */
  end?: boolean;
}

/**
 * Liste ordonnée des liens de navigation principale (partagée entre bureau et mobile).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: ROUTES.home, labelKey: 'nav.home', end: true },
  { path: ROUTES.algorithms, labelKey: 'nav.algorithms' },
  { path: ROUTES.lab, labelKey: 'nav.laboratory' },
  { path: ROUTES.cryptanalysis, labelKey: 'nav.cryptanalysis' },
  { path: ROUTES.docs, labelKey: 'nav.documentation' },
  { path: ROUTES.exercises, labelKey: 'nav.exercises' },
  { path: ROUTES.compare, labelKey: 'nav.compare' },
];
