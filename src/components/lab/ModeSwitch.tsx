import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';

/**
 * Mode de saisie du laboratoire : guidé (exemples du TD) ou personnalisé (saisie libre).
 */
export type InputMode = 'guided' | 'custom';

/**
 * Propriétés attendues par le composant `ModeSwitch`.
 */
export interface ModeSwitchProps {
  /** Mode de saisie actuellement sélectionné */
  value: InputMode;
  /** Fonction de rappel appelée lors du changement de mode */
  onChange: (value: InputMode) => void;
}

/**
 * Sélecteur bascule entre le mode guidé (« Exemples du TD ») et la saisie libre (« Saisie libre »).
 *
 * @param props Propriétés incluant le mode actif et le gestionnaire de changement.
 */
export function ModeSwitch({ value, onChange }: ModeSwitchProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <SegmentedToggle<InputMode>
      value={value}
      onChange={onChange}
      groupLabel={t('lab.mode.label')}
      options={[
        { value: 'guided', label: t('lab.mode.guided') },
        { value: 'custom', label: t('lab.mode.custom') },
      ]}
    />
  );
}
