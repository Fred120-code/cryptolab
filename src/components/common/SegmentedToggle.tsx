import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Option individuelle affichée dans un sélecteur segmenté.
 */
export interface SegmentedToggleOption<T extends string> {
  /** Valeur associée à l'option */
  value: T;
  /** Libellé affiché sur le bouton */
  label: string;
}

/**
 * Propriétés attendues par le composant `SegmentedToggle`.
 */
export interface SegmentedToggleProps<T extends string> {
  /** Valeur actuellement sélectionnée */
  value: T;
  /** Fonction de rappel appelée lors du changement de sélection */
  onChange: (value: T) => void;
  /** Liste des options à afficher */
  options: readonly SegmentedToggleOption<T>[];
  /** Libellé accessible pour le groupe de boutons */
  groupLabel: string;
  /** Désactive l'ensemble des boutons du groupe */
  disabled?: boolean;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

/**
 * Sélecteur segmenté générique composé de boutons bascule accessibles.
 *
 * Respecte les dimensions minimales de contact tactile (au moins 44x44 px)
 * et expose l'état actif via `aria-pressed`.
 *
 * @param props Propriétés incluant la valeur active, le gestionnaire et les options.
 */
export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  groupLabel,
  disabled = false,
  className,
}: SegmentedToggleProps<T>): JSX.Element {
  return (
    <div role="group" aria-label={groupLabel} className={cn('flex gap-2', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className="min-h-11 flex-1"
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
