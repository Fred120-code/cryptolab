import { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPaddingLength,
  parsePermutation,
  permutationAlgorithm,
  validateCiphertext,
  type PermutationParams,
  type PermutationStepData,
} from '@/algorithms/permutation';
import { OperationToggle } from '@/components/common/OperationToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { PlayerControls } from '@/components/visualizer/PlayerControls';
import { ResultPanel, type TextRange } from '@/components/visualizer/ResultPanel';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerLabels } from '@/hooks/usePlayerLabels';
import { useTranslatableText } from '@/hooks/useTranslatableText';
import type { ExecutionStep, OperationMode, ValidationResult } from '@/types';
import { normalizeLetters } from '@/utils/text';
import { PermutationVisualizer } from '@/visualizers/PermutationVisualizer';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<PermutationStepData>[] = [];

/**
 * Page de démonstration interactive temporaire du visualiseur de l'algorithme de permutation de blocs.
 *
 * Permet de saisir un message, une permutation en base 1 et les caractères de remplissage éventuels,
 * de choisir le mode opératoire, et de piloter l'animation des blocs pas à pas.
 */
export function PermutationPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();

  const [text, setText] = useState('INFORMATIQUE');
  const [permutationStr, setPermutationStr] = useState('2,4,1,3');
  const [paddingLengthStr, setPaddingLengthStr] = useState('');
  const [mode, setMode] = useState<OperationMode>('encrypt');

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
    <div className="flex flex-col gap-8">
      {/* Formulaire de configuration */}
      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 sm:p-6">
        {/* Saisie du message source */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="permutation-text-input">{t('playground.text')}</Label>
          <Input
            id="permutation-text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: INFORMATIQUE"
            className="h-11 text-base md:text-sm"
          />
          {text.length > 0 && normalizedText !== text && (
            <p className="text-xs text-muted-foreground">{t('playground.normalizedNotice')}</p>
          )}
          {paddingAdded > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('playground.paddingAdded', { padding: paddingAdded })}
            </p>
          )}
        </div>

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
            placeholder="Ex: 2,4,1,3"
            className="h-11 font-mono text-base md:text-sm"
          />
        </div>

        {/* Sélection de l'opération Chiffrer / Déchiffrer */}
        <div className="flex flex-col gap-2">
          <Label id="permutation-operation-label">{t('playground.operation')}</Label>
          <OperationToggle
            mode={mode}
            onChange={setMode}
            groupLabel={t('playground.operation')}
            encryptLabel={t('playground.encrypt')}
            decryptLabel={t('playground.decrypt')}
          />
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
              placeholder="0"
              className="h-11 tabular-nums text-base md:text-sm"
            />
          </div>
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
      </section>

      {/* Rendu ordonné : ResultPanel, PermutationVisualizer, PlayerControls, ExplanationPanel */}
      {validation.valid && result && (
        <>
          <ResultPanel
            input={normalizedText}
            output={result.output}
            mode={mode}
            inputRange={currentRange}
            outputRange={currentRange}
          />

          <PermutationVisualizer
            step={player.currentStep}
            mode={mode}
            stepDurationMs={stepDurationMs}
          />

          <PlayerControls player={player} labels={labels} />

          <ExplanationPanel step={player.currentStep} isPlaying={player.isPlaying} />
        </>
      )}
    </div>
  );
}
