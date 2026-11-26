import { useMemo, useRef, useState, type JSX } from 'react';
import { Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getPaddingLength,
  invertPermutation,
  parsePermutation,
  permutationAlgorithm,
  validateCiphertext,
  type PermutationParams,
  type PermutationStepData,
} from '@/algorithms/permutation';
import { OperationToggle } from '@/components/common/OperationToggle';
import { LabLinks } from '@/components/lab/LabLinks';
import { LabParamsCard } from '@/components/lab/LabParamsCard';
import { LabShell } from '@/components/lab/LabShell';
import { ModeSwitch, type InputMode } from '@/components/lab/ModeSwitch';
import { PresetSelect } from '@/components/lab/PresetSelect';
import { StagePlaceholder } from '@/components/lab/StagePlaceholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { PlayerControls } from '@/components/visualizer/PlayerControls';
import { ResultPanel, type TextRange } from '@/components/visualizer/ResultPanel';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerLabels } from '@/hooks/usePlayerLabels';
import { useTranslatableText } from '@/hooks/useTranslatableText';
import { cn } from '@/lib/utils';
import type { ExecutionStep, OperationMode, ValidationResult } from '@/types';
import { normalizeLetters } from '@/utils/text';
import { PermutationVisualizer } from '@/visualizers/PermutationVisualizer';
import { PERMUTATION_PRESETS } from './presets';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<PermutationStepData>[] = [];

const DEFAULT_PRESET = PERMUTATION_PRESETS[0]!;

/**
 * Page de laboratoire interactif de l'algorithme de permutation par blocs.
 *
 * Permet de choisir un exemple du TD en mode guidé ou de saisir librement
 * un message, une permutation en base 1 et le remplissage éventuel.
 */
export function PermutationPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();
  const textInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('guided');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [text, setText] = useState(() => DEFAULT_PRESET.text);
  const [permutationStr, setPermutationStr] = useState(() => DEFAULT_PRESET.permutation);
  const [paddingLengthStr, setPaddingLengthStr] = useState(() => DEFAULT_PRESET.paddingLength);
  const [mode, setMode] = useState<OperationMode>(() => DEFAULT_PRESET.mode);

  const isGuided = inputMode === 'guided';

  const presetOptions = useMemo(
    () =>
      PERMUTATION_PRESETS.map((p) => ({
        id: p.id,
        label: t(`lab.presets.permutation.${p.id}`),
      })),
    [t],
  );

  const applyPreset = (id: string): void => {
    const preset = PERMUTATION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setText(preset.text);
    setPermutationStr(preset.permutation);
    setPaddingLengthStr(preset.paddingLength);
    setMode(preset.mode);
  };

  const handlePresetChange = (id: string): void => {
    setPresetId(id);
    applyPreset(id);
  };

  const handleModeChange = (next: InputMode): void => {
    if (next === 'guided') {
      applyPreset(presetId);
    }
    setInputMode(next);
  };

  const handleClear = (): void => {
    setText('');
    textInputRef.current?.focus();
  };

  const normalizedText = useMemo(() => normalizeLetters(text), [text]);
  const permutation = useMemo(() => parsePermutation(permutationStr), [permutationStr]);

  const paddingLength = useMemo(() => {
    if (mode !== 'decrypt' || paddingLengthStr.trim() === '') {
      return undefined;
    }
    const parsed = Number(paddingLengthStr);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [mode, paddingLengthStr]);

  const params = useMemo<PermutationParams>(() => {
    if (mode === 'decrypt') {
      return paddingLength !== undefined ? { permutation, paddingLength } : { permutation };
    }
    return { permutation };
  }, [mode, permutation, paddingLength]);

  const validation = useMemo<ValidationResult>(() => {
    const baseValidation = permutationAlgorithm.validate(params);
    if (!baseValidation.valid) {
      return baseValidation;
    }
    if (mode === 'decrypt' && normalizedText.length > 0) {
      const cipherValidation = validateCiphertext(normalizedText, params);
      if (!cipherValidation.valid) {
        return cipherValidation;
      }
    }
    return { valid: true };
  }, [params, mode, normalizedText]);

  const inverseText = useMemo(() => {
    if (!validation.valid) {
      return '';
    }
    return invertPermutation(permutation).join(', ');
  }, [validation.valid, permutation]);

  const result = useMemo(() => {
    if (!validation.valid) {
      return null;
    }
    return permutationAlgorithm.getSteps(text, params, mode);
  }, [text, params, mode, validation.valid]);

  const steps = result ? result.steps : EMPTY_STEPS;
  const player = usePlayer(steps);
  const stepDurationMs = 1200 / player.speed;

  const currentStep = player.currentStep;
  const currentRange: TextRange | undefined = currentStep
    ? {
        start: currentStep.data.startPosition,
        end: currentStep.data.startPosition + currentStep.data.blockSize,
      }
    : undefined;

  const paddingAdded =
    validation.valid && mode === 'encrypt'
      ? getPaddingLength(normalizedText.length, permutation.length)
      : 0;

  return (
    <LabShell
      form={
        <LabParamsCard action={<ModeSwitch value={inputMode} onChange={handleModeChange} />}>
          {isGuided && (
            <PresetSelect presets={presetOptions} value={presetId} onChange={handlePresetChange} />
          )}

          {/* Saisie du message source */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="permutation-text-input">{t('playground.text')}</Label>
            <div className="flex gap-2">
              <Input
                ref={textInputRef}
                id="permutation-text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('lab.placeholders.text')}
                readOnly={isGuided}
                aria-readonly={isGuided}
                className={cn('h-11 flex-1 text-base md:text-sm', isGuided && 'bg-muted/50')}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                disabled={isGuided || text.length === 0}
                onClick={handleClear}
                aria-label={t('lab.clear')}
              >
                <Eraser className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Saisie de l'ordre de permutation */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="permutation-order-input">{t('playground.permutationOrder')}</Label>
              <Input
                id="permutation-order-input"
                value={permutationStr}
                onChange={(e) => setPermutationStr(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                inputMode="numeric"
                placeholder={t('lab.placeholders.permutation')}
                readOnly={isGuided}
                aria-readonly={isGuided}
                className={cn('h-11 font-mono text-base md:text-sm', isGuided && 'bg-muted/50')}
              />
              <p className="min-h-4 text-xs text-muted-foreground">
                {inverseText ? t('lab.inversePermutation', { value: inverseText }) : ''}
              </p>
            </div>

            {/* Saisie facultative du padding à retirer en déchiffrement */}
            {mode === 'decrypt' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="permutation-padding-input">{t('playground.paddingToRemove')}</Label>
                <Input
                  id="permutation-padding-input"
                  type="number"
                  min={0}
                  step={1}
                  value={paddingLengthStr}
                  onChange={(e) => setPaddingLengthStr(e.target.value)}
                  placeholder={t('lab.placeholders.padding')}
                  readOnly={isGuided}
                  aria-readonly={isGuided}
                  className={cn(
                    'h-11 tabular-nums text-base md:text-sm',
                    isGuided && 'bg-muted/50',
                  )}
                />
              </div>
            )}
          </div>

          {/* Sélection de l'opération Chiffrer / Déchiffrer */}
          <div className="flex flex-col gap-2">
            <Label id="permutation-operation-label">{t('playground.operation')}</Label>
            <OperationToggle
              mode={mode}
              onChange={setMode}
              disabled={isGuided}
              groupLabel={t('playground.operation')}
              encryptLabel={t('playground.encrypt')}
              decryptLabel={t('playground.decrypt')}
            />
          </div>

          {text.length > 0 && normalizedText !== text && (
            <p className="text-xs text-muted-foreground">{t('playground.normalizedNotice')}</p>
          )}
          {paddingAdded > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('playground.paddingAdded', { padding: paddingAdded })}
            </p>
          )}

          {/* Messages d'erreur de validation des paramètres */}
          {!validation.valid && (
            <div
              role="alert"
              className="flex flex-col gap-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {validation.errors.map((err, i) => (
                <p key={i}>{tt(err)}</p>
              ))}
            </div>
          )}
        </LabParamsCard>
      }
      stage={
        <>
          {validation.valid && result ? (
            <>
              <PermutationVisualizer
                step={player.currentStep}
                mode={mode}
                stepDurationMs={stepDurationMs}
              />
              <PlayerControls player={player} labels={labels} />
            </>
          ) : (
            <StagePlaceholder />
          )}
          <LabLinks algorithm="permutation" />
        </>
      }
      details={
        validation.valid && result ? (
          <>
            <ResultPanel
              input={normalizedText}
              output={result.output}
              mode={mode}
              inputRange={currentRange}
              outputRange={currentRange}
            />
            <ExplanationPanel step={player.currentStep} isPlaying={player.isPlaying} />
          </>
        ) : null
      }
    />
  );
}
