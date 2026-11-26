import { useMemo, useRef, useState, type JSX } from 'react';
import { Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  buildAlphabetFromKeyword,
  substitutionAlgorithm,
  type SubstitutionStepData,
} from '@/algorithms/substitution';
import { OperationToggle } from '@/components/common/OperationToggle';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';
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
import { SubstitutionVisualizer } from '@/visualizers/SubstitutionVisualizer';
import { SUBSTITUTION_PRESETS } from './presets';

/** Type désignant la source utilisée pour générer l'alphabet de substitution */
type AlphabetSource = 'keyword' | 'custom';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<SubstitutionStepData>[] = [];

const DEFAULT_PRESET = SUBSTITUTION_PRESETS[0]!;

/**
 * Page de laboratoire interactif de l'algorithme de substitution monoalphabétique.
 *
 * Permet de choisir un exemple du TD en mode guidé ou de définir librement
 * un message et un alphabet de substitution, et de piloter l'animation pas à pas.
 */
export function SubstitutionPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();
  const textInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('guided');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [text, setText] = useState(() => DEFAULT_PRESET.text);
  const [source, setSource] = useState<AlphabetSource>(() => DEFAULT_PRESET.source);
  const [keyword, setKeyword] = useState(() => DEFAULT_PRESET.keyword);
  const [customAlphabet, setCustomAlphabet] = useState(
    () => DEFAULT_PRESET.alphabet || 'ZYXWVUTSRQPONMLKJIHGFEDCBA',
  );
  const [mode, setMode] = useState<OperationMode>(() => DEFAULT_PRESET.mode);

  const isGuided = inputMode === 'guided';

  const presetOptions = useMemo(
    () =>
      SUBSTITUTION_PRESETS.map((p) => ({
        id: p.id,
        label: t(`lab.presets.substitution.${p.id}`),
      })),
    [t],
  );

  const applyPreset = (id: string): void => {
    const preset = SUBSTITUTION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setText(preset.text);
    setSource(preset.source);
    if (preset.source === 'keyword') {
      setKeyword(preset.keyword);
    } else {
      setCustomAlphabet(preset.alphabet);
    }
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

  const alphabet = useMemo(() => {
    return source === 'keyword' ? buildAlphabetFromKeyword(keyword) : customAlphabet;
  }, [source, keyword, customAlphabet]);

  const validation = substitutionAlgorithm.validate({ alphabet });

  const result = useMemo(() => {
    if (!validation.valid) {
      return null;
    }
    return substitutionAlgorithm.getSteps(text, { alphabet }, mode);
  }, [text, alphabet, mode, validation.valid]);

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
            <Label htmlFor="substitution-text-input">{t('playground.text')}</Label>
            <div className="flex gap-2">
              <Input
                ref={textInputRef}
                id="substitution-text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: CRYPTOGRAPHIE"
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

          {/* Choix de la source de l'alphabet (Mot-clé ou Personnalisé) */}
          <div className="flex flex-col gap-2">
            <Label id="substitution-source-label">{t('playground.alphabetSource')}</Label>
            <SegmentedToggle<AlphabetSource>
              value={source}
              onChange={setSource}
              disabled={isGuided}
              groupLabel={t('playground.alphabetSource')}
              className="flex-wrap"
              options={[
                { value: 'keyword', label: t('playground.sourceKeyword') },
                { value: 'custom', label: t('playground.sourceCustom') },
              ]}
            />
          </div>

          {/* Saisie du mot-clé ou de l'alphabet personnalisé */}
          {source === 'keyword' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="substitution-keyword-input">{t('playground.keyword')}</Label>
              <Input
                id="substitution-keyword-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex: SECURITE"
                readOnly={isGuided}
                aria-readonly={isGuided}
                className={cn(
                  'h-11 font-mono uppercase text-base md:text-sm',
                  isGuided && 'bg-muted/50',
                )}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="substitution-custom-input">{t('playground.customAlphabet')}</Label>
              <Input
                id="substitution-custom-input"
                value={customAlphabet}
                onChange={(e) => setCustomAlphabet(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Ex: ZYXWVUTSRQPONMLKJIHGFEDCBA"
                readOnly={isGuided}
                aria-readonly={isGuided}
                className={cn(
                  'h-11 font-mono uppercase text-base md:text-sm',
                  isGuided && 'bg-muted/50',
                )}
              />
            </div>
          )}

          {/* Sélection de l'opération Chiffrer / Déchiffrer */}
          <div className="flex flex-col gap-2">
            <Label id="substitution-operation-label">{t('playground.operation')}</Label>
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
              <SubstitutionVisualizer
                step={player.currentStep}
                alphabet={alphabet}
                mode={mode}
                stepDurationMs={stepDurationMs}
              />
              <PlayerControls player={player} labels={labels} />
            </>
          ) : (
            <StagePlaceholder />
          )}
          <LabLinks algorithm="substitution" />
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
