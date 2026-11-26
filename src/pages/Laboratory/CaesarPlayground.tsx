import { useMemo, useRef, useState, type JSX } from 'react';
import { Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { caesarAlgorithm, type CaesarStepData } from '@/algorithms/caesar';
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
import type { ExecutionStep, OperationMode } from '@/types';
import { CaesarVisualizer } from '@/visualizers/CaesarVisualizer';
import { CAESAR_PRESETS } from './presets';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<CaesarStepData>[] = [];

const DEFAULT_PRESET = CAESAR_PRESETS[0]!;

/**
 * Page de laboratoire interactif de l'algorithme de César.
 *
 * Permet de choisir un exemple du TD en mode guidé ou de saisir librement
 * un message et une clé de décalage, et de piloter l'animation pas à pas.
 */
export function CaesarPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();
  const textInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('guided');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [text, setText] = useState(() => DEFAULT_PRESET.text);
  const [shiftStr, setShiftStr] = useState(() => String(DEFAULT_PRESET.shift));
  const [mode, setMode] = useState<OperationMode>(() => DEFAULT_PRESET.mode);

  const isGuided = inputMode === 'guided';

  const presetOptions = useMemo(
    () =>
      CAESAR_PRESETS.map((p) => ({
        id: p.id,
        label: t(`lab.presets.caesar.${p.id}`),
      })),
    [t],
  );

  const applyPreset = (id: string): void => {
    const preset = CAESAR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setText(preset.text);
    setShiftStr(String(preset.shift));
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

  const shiftNum = Number(shiftStr);
  const validation = caesarAlgorithm.validate({ shift: shiftNum });

  const result = useMemo(() => {
    if (!validation.valid) {
      return null;
    }
    return caesarAlgorithm.getSteps(text, { shift: shiftNum }, mode);
  }, [text, shiftNum, mode, validation.valid]);

  const steps = result ? result.steps : EMPTY_STEPS;
  const player = usePlayer(steps);
  const stepDurationMs = 1200 / player.speed;

  const currentStep = player.currentStep;
  const currentRange: TextRange | undefined = currentStep
    ? { start: currentStep.data.position, end: currentStep.data.position + 1 }
    : undefined;

  return (
    <LabShell
      form={
        <LabParamsCard action={<ModeSwitch value={inputMode} onChange={handleModeChange} />}>
          {isGuided && (
            <PresetSelect presets={presetOptions} value={presetId} onChange={handlePresetChange} />
          )}

          {/* Saisie du message */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="caesar-text-input">{t('playground.text')}</Label>
            <div className="flex gap-2">
              <Input
                ref={textInputRef}
                id="caesar-text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: BONJOUR"
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
            {/* Saisie de la clé de décalage */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="caesar-shift-input">{t('playground.shift')}</Label>
              <Input
                id="caesar-shift-input"
                type="number"
                step={1}
                value={shiftStr}
                onChange={(e) => setShiftStr(e.target.value)}
                readOnly={isGuided}
                aria-readonly={isGuided}
                className={cn('h-11 tabular-nums text-base md:text-sm', isGuided && 'bg-muted/50')}
              />
            </div>
          </div>

          {/* Sélection de l'opération Chiffrer / Déchiffrer */}
          <div className="flex flex-col gap-2">
            <Label id="caesar-operation-label">{t('playground.operation')}</Label>
            <OperationToggle
              mode={mode}
              onChange={setMode}
              disabled={isGuided}
              groupLabel={t('playground.operation')}
              encryptLabel={t('playground.encrypt')}
              decryptLabel={t('playground.decrypt')}
            />
          </div>

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
              <CaesarVisualizer
                step={player.currentStep}
                mode={mode}
                stepDurationMs={stepDurationMs}
              />
              <PlayerControls player={player} labels={labels} />
            </>
          ) : (
            <StagePlaceholder />
          )}
          <LabLinks algorithm="caesar" />
        </>
      }
      details={
        validation.valid && result ? (
          <>
            <ResultPanel
              input={text}
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
