import { useState, type ComponentType, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CaesarPlayground } from './CaesarPlayground';
import { PermutationPlayground } from './PermutationPlayground';
import { SubstitutionPlayground } from './SubstitutionPlayground';

/**
 * Définition d'un algorithme accessible dans le laboratoire d'expérimentation.
 */
interface AlgorithmDefinition {
  /** Identifiant unique de l'algorithme */
  id: string;
  /** Clé de traduction pour le libellé du bouton */
  labelKey: string;
  /** Composant de terrain d'expérimentation associé */
  component: ComponentType;
}

const DEFAULT_ALGORITHM: AlgorithmDefinition = {
  id: 'caesar',
  labelKey: 'playground.caesar',
  component: CaesarPlayground,
};

/** Liste des algorithmes disponibles dans le laboratoire */
const ALGORITHMS: AlgorithmDefinition[] = [
  DEFAULT_ALGORITHM,
  { id: 'substitution', labelKey: 'playground.substitution', component: SubstitutionPlayground },
  { id: 'permutation', labelKey: 'playground.permutation', component: PermutationPlayground },
];

/**
 * Page temporaire de laboratoire permettant d'explorer et comparer les visualiseurs cryptographiques.
 *
 * Contient l'en-tête de l'application (titre CryptoLab, sélecteur de langue, notice d'avertissement),
 * le sélecteur d'algorithme (César / Substitution / Permutation) et le terrain d'expérimentation actif.
 */
export function Playground(): JSX.Element {
  const { t } = useTranslation();
  const [algorithmId, setAlgorithmId] = useState('caesar');

  const activeAlgorithm = ALGORITHMS.find((a) => a.id === algorithmId) ?? DEFAULT_ALGORITHM;
  const ActiveComponent = activeAlgorithm.component;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      {/* En-tête principal de l'application */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            CryptoLab
          </h1>
          <LanguageSwitcher />
        </div>
        <p className="text-sm text-muted-foreground">{t('playground.notice')}</p>
      </header>

      {/* Sélecteur d'algorithme */}
      <div className="flex flex-col gap-2">
        <Label id="playground-algorithm-label">{t('playground.algorithm')}</Label>
        <div role="group" aria-labelledby="playground-algorithm-label" className="flex gap-2">
          {ALGORITHMS.map(({ id, labelKey }) => (
            <Button
              key={id}
              type="button"
              variant={algorithmId === id ? 'default' : 'outline'}
              aria-pressed={algorithmId === id}
              onClick={() => setAlgorithmId(id)}
              className="min-h-11 flex-1"
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Affichage de la page de laboratoire active */}
      <ActiveComponent />
    </main>
  );
}
