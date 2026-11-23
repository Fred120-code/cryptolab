import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OperationMode } from '@/types';

/**
 * Propriétés attendues par le composant `OperationToggle`.
 */
export interface OperationToggleProps {
  /** Mode d'opération cryptographique actuellement sélectionné */
  mode: OperationMode;
  /** Fonction de rappel appelée lors du changement de mode */
  onChange: (mode: OperationMode) => void;
  /** Libellé accessible pour le groupe de boutons */
  groupLabel: string;
  /** Libellé affiché sur le bouton de chiffrement */
  encryptLabel: string;
  /** Libellé affiché sur le bouton de déchiffrement */
  decryptLabel: string;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

/**
 * Sélecteur d'opération cryptographique composé de deux boutons bascule accessibles (Chiffrer / Déchiffrer).
 *
 * Utilise des boutons de variante sémantique respectant les dimensions minimales de contact
 * tactile (au moins 44x44 px) et des attributs ARIA appropriés.
 *
 * @param props Propriétés incluant le mode, le gestionnaire de changement et les libellés traduits.
 */
export function OperationToggle({
  mode,
  onChange,
  groupLabel,
  encryptLabel,
  decryptLabel,
  className,
}: OperationToggleProps): JSX.Element {
  return (
    <div role="group" aria-label={groupLabel} className={cn('flex gap-2', className)}>
      <Button
        type="button"
        variant={mode === 'encrypt' ? 'default' : 'outline'}
        aria-pressed={mode === 'encrypt'}
        onClick={() => onChange('encrypt')}
        className="min-h-11 flex-1"
      >
        {encryptLabel}
      </Button>
      <Button
        type="button"
        variant={mode === 'decrypt' ? 'default' : 'outline'}
        aria-pressed={mode === 'decrypt'}
        onClick={() => onChange('decrypt')}
        className="min-h-11 flex-1"
      >
        {decryptLabel}
      </Button>
    </div>
  );
}
