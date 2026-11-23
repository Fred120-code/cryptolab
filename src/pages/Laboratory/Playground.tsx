import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CaesarPlayground } from './CaesarPlayground';
import { SubstitutionPlayground } from './SubstitutionPlayground';

/** Algorithmes cryptographiques disponibles dans le laboratoire temporaire */
type AlgorithmChoice = 'caesar' | 'substitution';

/**
 * Page temporaire de laboratoire permettant d'explorer et comparer les visualiseurs.
 *
 * Contient l'en-tête de l'application (titre CryptoLab, sélecteur de langue, notice d'avertissement),
 * le sélecteur d'algorithme (César / Substitution) et le terrain d'expérimentation correspondant.
 */
export function Playground(): JSX.Element {
  const { t } = useTranslation();
  const [algorithm, setAlgorithm] = useState<AlgorithmChoice>('caesar');

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

      {/* Sélecteur d'algorithme (César / Substitution) */}
      <div className="flex flex-col gap-2">
        <Label id="playground-algorithm-label">{t('playground.algorithm')}</Label>
        <div role="group" aria-labelledby="playground-algorithm-label" className="flex gap-2">
          <Button
            type="button"
            variant={algorithm === 'caesar' ? 'default' : 'outline'}
            aria-pressed={algorithm === 'caesar'}
            onClick={() => setAlgorithm('caesar')}
            className="min-h-11 flex-1"
          >
            {t('playground.caesar')}
          </Button>
          <Button
            type="button"
            variant={algorithm === 'substitution' ? 'default' : 'outline'}
            aria-pressed={algorithm === 'substitution'}
            onClick={() => setAlgorithm('substitution')}
            className="min-h-11 flex-1"
          >
            {t('playground.substitution')}
          </Button>
        </div>
      </div>

      {/* Affichage de la page de laboratoire active */}
      {algorithm === 'caesar' ? <CaesarPlayground /> : <SubstitutionPlayground />}
    </main>
  );
}
