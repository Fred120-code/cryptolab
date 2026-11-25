import { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { vigenereAlgorithm, type VigenereStepData } from '@/algorithms/vigenere';
import { OperationToggle } from '@/components/common/OperationToggle';
import { LabParamsCard } from '@/components/lab/LabParamsCard';
import { LabShell } from '@/components/lab/LabShell';
import { StagePlaceholder } from '@/components/lab/StagePlaceholder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { PlayerControls } from '@/components/visualizer/PlayerControls';
import { ResultPanel, type TextRange } from '@/components/visualizer/ResultPanel';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerLabels } from '@/hooks/usePlayerLabels';
import { useTranslatableText } from '@/hooks/useTranslatableText';
import type { ExecutionStep, OperationMode } from '@/types';
import { VigenereVisualizer } from '@/visualizers/VigenereVisualizer';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<VigenereStepData>[] = [];

/**
 * Page de démonstration interactive temporaire du visualiseur de l'algorithme de Vigenère.
 *
 * Permet de saisir un message et une clé textuelle, de choisir le mode opératoire (chiffrement / déchiffrement),
 * et de piloter l'animation pas à pas.
 */
export function VigenerePlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();

  const [text, setText] = useState('BONJOUR');
  const [key, setKey] = useState('CLE');
  const [mode, setMode] = useState<OperationMode>('encrypt');

  const validation = vigenereAlgorithm.validate({ key });

  const result = useMemo(() => {
    if (!validation.valid) {
      return null;
    }
    return vigenereAlgorithm.getSteps(text, { key }, mode);
  }, [text, key, mode, validation.valid]);

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
        <LabParamsCard>
          {/* Saisie du message */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="vigenere-text-input">{t('playground.text')}</Label>
            <Input
              id="vigenere-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: BONJOUR"
              className="h-11 text-base md:text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Saisie de la clé */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="vigenere-key-input">{t('playground.keyWord')}</Label>
              <Input
                id="vigenere-key-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Ex: CLE"
                className="h-11 font-mono text-base tracking-wider uppercase md:text-sm"
              />
            </div>
          </div>

          {/* Sélecteur de mode d'opération */}
          <div className="flex flex-col gap-2">
            <Label id="vigenere-operation-label">{t('playground.operation')}</Label>
            <OperationToggle
              mode={mode}
              onChange={setMode}
              groupLabel={t('playground.operation')}
              encryptLabel={t('playground.encrypt')}
              decryptLabel={t('playground.decrypt')}
            />
          </div>

          {/* Message d'erreur de validation de la clé */}
          {!validation.valid && (
            <div
              role="alert"
              className="flex flex-col gap-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {validation.errors.map((err) => (
                <p key={err.key}>{tt(err)}</p>
              ))}
            </div>
          )}
        </LabParamsCard>
      }
      stage={
        result !== null ? (
          <>
            <VigenereVisualizer
              steps={steps}
              currentIndex={player.currentIndex}
              onSelect={player.goTo}
              mode={mode}
              stepDurationMs={stepDurationMs}
            />
            <PlayerControls player={player} labels={labels} />
          </>
        ) : (
          <StagePlaceholder />
        )
      }
      details={
        result !== null ? (
          <>
            <ResultPanel
              input={text}
              output={result.output}
              mode={mode}
              inputRange={currentRange}
              outputRange={currentRange}
            />
            <ExplanationPanel step={currentStep} isPlaying={player.isPlaying} />
          </>
        ) : null
      }
    />
  );
}
