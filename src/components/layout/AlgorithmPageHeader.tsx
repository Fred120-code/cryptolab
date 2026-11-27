import type { JSX } from 'react';
import { AlgorithmNav } from '@/components/navigation/AlgorithmNav';
import type { AlgorithmId } from '@/types';

/**
 * Propriétés attendues par le composant `AlgorithmPageHeader`.
 */
export interface AlgorithmPageHeaderProps {
  /** Titre principal de la page */
  title: string;
  /** Fonction construisant le chemin URL pour un algorithme donné */
  buildPath: (id: AlgorithmId) => string;
  /** Libellé accessible de la zone de navigation */
  navLabel: string;
}

/**
 * En-tête compact partagé entre les pages liées à un algorithme (laboratoire, cryptanalyse, documentation).
 *
 * Affiche le titre principal et les onglets de navigation entre algorithmes sur une même ligne.
 *
 * @param props Propriétés incluant le titre, le constructeur de route et le libellé de navigation.
 */
export function AlgorithmPageHeader({
  title,
  buildPath,
  navLabel,
}: AlgorithmPageHeaderProps): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <AlgorithmNav buildPath={buildPath} ariaLabel={navLabel} />
    </div>
  );
}
