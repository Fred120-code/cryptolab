import type { AlgorithmId } from '@/types';

/**
 * Constantes des chemins d'accès principaux de l'application.
 */
export const ROUTES = {
  home: '/',
  algorithms: '/algorithms',
  lab: '/lab',
  docs: '/docs',
  cryptanalysis: '/cryptanalysis',
  exercises: '/exercises',
  compare: '/compare',
} as const;

/**
 * Construit le chemin d'accès au laboratoire pour un algorithme donné.
 *
 * @param id Identifiant de l'algorithme.
 * @returns Chemin complet vers le laboratoire de l'algorithme.
 */
export function labPath(id: AlgorithmId): string {
  return `${ROUTES.lab}/${id}`;
}

/**
 * Construit le chemin d'accès à la documentation pour un algorithme donné.
 *
 * @param id Identifiant de l'algorithme.
 * @returns Chemin complet vers la documentation de l'algorithme.
 */
export function docsPath(id: AlgorithmId): string {
  return `${ROUTES.docs}/${id}`;
}

/**
 * Construit le chemin d'accès à la cryptanalyse pour un algorithme donné.
 *
 * @param id Identifiant de l'algorithme.
 * @returns Chemin complet vers la cryptanalyse de l'algorithme.
 */
export function cryptanalysisPath(id: AlgorithmId): string {
  return `${ROUTES.cryptanalysis}/${id}`;
}
