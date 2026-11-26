import { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildAlphabetFromKeyword,
  substitutionAlgorithm,
  type SubstitutionStepData,
} from '@/algorithms/substitution';
import { OperationToggle } from '@/components/common/OperationToggle';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';
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
import { SubstitutionVisualizer } from '@/visualizers/SubstitutionVisualizer';

/** Type désignant la source utilisée pour générer l'alphabet de substitution */
type AlphabetSource = 'keyword' | 'custom';

/** Tableau vide constant pour éviter les réinitialisations intempestives du hook `usePlayer` */
const EMPTY_STEPS: ExecutionStep<SubstitutionStepData>[] = [];

/**
 * Page de démonstration interactive temporaire du visualiseur de l'algorithme de substitution.
 *
 * Permet de saisir un message, de définir l'alphabet de substitution via un mot-clé ou directement,
 * de choisir le mode opératoire (chiffrement / déchiffrement), et de piloter l'animation pas à pas.
 */
export function SubstitutionPlayground(): JSX.Element {
  const { t } = useTranslation();
  const tt = useTranslatableText();
  const labels = usePlayerLabels();

  const [text, setText] = useState('CRYPTOGRAPHIE');
  const [source, setSource] = useState<AlphabetSource>('keyword');
  const [keyword, setKeyword] = useState('SECURITE');
  const [customAlphabet, setCustomAlphabet] = useState('ZYXWVUTSRQPONMLKJIHGFEDCBA');
  const [mode, setMode] = useState<OperationMode>('encrypt');

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
        <LabParamsCard>
          {/* Saisie du message */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="substitution-text-input">{t('playground.text')}</Label>
            <Input
              id="substitution-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: CRYPTOGRAPHIE"
              className="h-11 text-base md:text-sm"
            />
          </div>

          {/* Choix de la source de l'alphabet (Mot-clé ou Personnalisé) */}
          <div className="flex flex-col gap-2">
            <Label id="substitution-source-label">{t('playground.alphabetSource')}</Label>
            <SegmentedToggle<AlphabetSource>
              value={source}
              onChange={setSource}
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
                className="h-11 font-mono uppercase text-base md:text-sm"
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
                className="h-11 font-mono uppercase text-base md:text-sm"
              />
            </div>
          )}

          {/* Sélection de l'opération Chiffrer / Déchiffrer */}
          <div className="flex flex-col gap-2">
            <Label id="substitution-operation-label">{t('playground.operation')}</Label>
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
        </LabParamsCard>
      }
      stage={
        validation.valid && result ? (
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
        )
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
