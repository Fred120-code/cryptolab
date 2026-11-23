import { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { caesarAlgorithm, type CaesarStepData } from '@/algorithms/caesar';
import { OperationToggle } from '@/components/common/OperationToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { PlayerControls } from '@/components/visualizer/PlayerControls';
import { ResultPanel, type TextRange } from '@/components/visualizer/ResultPanel';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerLabels } from '@/hooks/usePlayerLabels';
import { useTranslatableText } from '@/hooks/useTranslatableText';
import type { ExecutionStep, OperationMode } from '@/types';
import { CaesarVisualizer } from '@/visualizers/CaesarVisualizer';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<CaesarStepData>[] = [];

/**
 * Page de démonstration interactive temporaire du visualiseur de l'algorithme de César.
 *
 * Permet de saisir un message et une clé de décalage, de choisir le mode opératoire,
 * et de piloter l'animation pas à pas avec les contrôles de lecture, le panneau de résultat
 * et le panneau explicatif.
 */
export function CaesarPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();

  const [text, setText] = useState('BONJOUR');
  const [shiftStr, setShiftStr] = useState('3');
  const [mode, setMode] = useState<OperationMode>('encrypt');

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
    <div className="flex flex-col gap-8">
      {/* Formulaire de configuration (sans balise <form>) */}
      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Saisie du message */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="caesar-text-input">{t('playground.text')}</Label>
            <Input
              id="caesar-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: BONJOUR"
              className="h-11 text-base md:text-sm"
            />
          </div>

          {/* Saisie de la clé de décalage */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="caesar-shift-input">{t('playground.shift')}</Label>
            <Input
              id="caesar-shift-input"
              type="number"
              step={1}
              value={shiftStr}
              onChange={(e) => setShiftStr(e.target.value)}
              className="h-11 tabular-nums text-base md:text-sm"
            />
          </div>
        </div>

        {/* Sélection de l'opération Chiffrer / Déchiffrer */}
        <div className="flex flex-col gap-2">
          <Label id="caesar-operation-label">{t('playground.operation')}</Label>
          <OperationToggle
            mode={mode}
            onChange={setMode}
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
      </section>

      {/* Panneau de résultat complet avec copie et surbrillance synchronisée */}
      {validation.valid && result && (
        <ResultPanel
          input={text}
          output={result.output}
          mode={mode}
          inputRange={currentRange}
          outputRange={currentRange}
        />
      )}

      {/* Visualiseur circulaire animé */}
      <CaesarVisualizer step={player.currentStep} mode={mode} stepDurationMs={stepDurationMs} />

      {/* Barre de commandes de transport */}
      <PlayerControls player={player} labels={labels} />

      {/* Panneau explicatif de l'étape active */}
      <ExplanationPanel step={player.currentStep} isPlaying={player.isPlaying} />
    </div>
  );
}
