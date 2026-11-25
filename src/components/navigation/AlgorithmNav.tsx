import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALGORITHM_IDS } from '@/config/algorithms';
import { cn } from '@/lib/utils';
import type { AlgorithmId } from '@/types';

/**
 * Propriétés attendues par le composant `AlgorithmNav`.
 */
export interface AlgorithmNavProps {
  /** Fonction construisant le chemin URL pour un algorithme donné */
  buildPath: (id: AlgorithmId) => string;
  /** Libellé accessible de la zone de navigation */
  ariaLabel: string;
}

/**
 * Barre d'onglets de navigation entre les algorithmes cryptographiques supportés.
 *
 * Utilise des composants `NavLink` de React Router qui appliquent automatiquement `aria-current="page"`.
 *
 * @param props Propriétés de navigation et d'accessibilité.
 */
export function AlgorithmNav({ buildPath, ariaLabel }: AlgorithmNavProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
        {ALGORITHM_IDS.map((id) => (
          <li key={id}>
            <NavLink
              to={buildPath(id)}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                )
              }
            >
              {t(`algorithms.${id}.name`)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
