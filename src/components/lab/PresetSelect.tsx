import { useId, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';

/**
 * Option d'exemple prédéfini affichée dans `PresetSelect`.
 */
export interface PresetOption {
  /** Identifiant unique de l'exemple */
  id: string;
  /** Libellé traduit affiché dans la liste déroulante */
  label: string;
}

/**
 * Propriétés attendues par le composant `PresetSelect`.
 */
export interface PresetSelectProps {
  /** Liste des exemples prédéfinis disponibles */
  presets: readonly PresetOption[];
  /** Identifiant de l'exemple actuellement sélectionné */
  value: string;
  /** Fonction de rappel appelée lors de la sélection d'un autre exemple */
  onChange: (id: string) => void;
}

/**
 * Liste déroulante de sélection d'un exemple prédéfini en mode guidé.
 *
 * @param props Propriétés incluant la liste des presets, la valeur active et le gestionnaire.
 */
export function PresetSelect({ presets, value, onChange }: PresetSelectProps): JSX.Element {
  const { t } = useTranslation();
  const selectId = useId();
  const hintId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={selectId}>{t('lab.presetLabel')}</Label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        className="h-11 min-h-[44px] w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
      <p id={hintId} className="text-xs text-muted-foreground">
        {t('lab.guidedHint')}
      </p>
    </div>
  );
}
