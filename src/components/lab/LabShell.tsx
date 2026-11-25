import type { JSX, ReactNode } from 'react';

/**
 * Propriétés attendues par le composant `LabShell`.
 */
export interface LabShellProps {
  /** Formulaire de configuration des paramètres de l'algorithme */
  form: ReactNode;
  /** Scène principale contenant le visualiseur animé et les contrôles de lecture */
  stage: ReactNode;
  /** Panneaux de détails (résultat complet et explication de l'étape) */
  details: ReactNode;
}

/**
 * Gabarit de mise en page à deux colonnes pour les laboratoires cryptographiques.
 *
 * Sur petit écran, empile dans l'ordre : paramètres, scène, puis détails.
 * Sur grand écran (`lg`), place les paramètres et détails à gauche et la scène à droite
 * (collée sous l'en-tête lorsque la hauteur d'écran atteint au moins 700 px).
 *
 * @param props Zones de contenu (`form`, `stage`, `details`).
 */
export function LabShell({ form, stage, details }: LabShellProps): JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-6">
      <div className="lg:col-start-1 lg:row-start-1">{form}</div>
      <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start [@media(min-height:700px)]:lg:sticky [@media(min-height:700px)]:lg:top-20">
        {stage}
      </div>
      <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">{details}</div>
    </div>
  );
}
