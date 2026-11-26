import type { JSX } from 'react';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';
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
  /** Désactive le sélecteur */
  disabled?: boolean;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

/**
 * Sélecteur d'opération cryptographique composé de deux boutons bascule accessibles (Chiffrer / Déchiffrer).
 *
 * @param props Propriétés incluant le mode, le gestionnaire de changement et les libellés traduits.
 */
export function OperationToggle({
  mode,
  onChange,
  groupLabel,
  encryptLabel,
  decryptLabel,
  disabled,
  className,
}: OperationToggleProps): JSX.Element {
  return (
    <SegmentedToggle<OperationMode>
      value={mode}
      onChange={onChange}
      groupLabel={groupLabel}
      disabled={disabled}
      className={className}
      options={[
        { value: 'encrypt', label: encryptLabel },
        { value: 'decrypt', label: decryptLabel },
      ]}
    />
  );
}
