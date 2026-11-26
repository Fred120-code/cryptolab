import { useId, useMemo, useState, type JSX } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { caesarAlgorithm } from '@/algorithms';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';
import { BestGuess } from '@/components/cryptanalysis/BestGuess';
import { CandidateTable, type CandidateRow } from '@/components/cryptanalysis/CandidateTable';
import { LabParamsCard } from '@/components/lab/LabParamsCard';
import { LabShell } from '@/components/lab/LabShell';
import { StagePlaceholder } from '@/components/lab/StagePlaceholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { labPath } from '@/config/routes';
import { bruteForceCaesar, type LanguageChoice } from '@/cryptanalysis';

const LONG_PLAINTEXT =
  'LA CRYPTOGRAPHIE EST UNE DISCIPLINE FONDAMENTALE DE LA SECURITE INFORMATIQUE';
const LONG_CIPHERTEXT = caesarAlgorithm.encrypt(LONG_PLAINTEXT, { shift: 5 });

type SortMode = 'shift' | 'readability';

/**
 * Outil de cryptanalyse par force brute pour le chiffre de César.
 *
 * Teste les 26 décalages possibles, classe les résultats par lisibilité statistique
 * et lexicale, et met en avant l'hypothèse la plus probable avec son niveau de confiance.
 */
export function CaesarCryptanalysis(): JSX.Element {
  const { t } = useTranslation();
  const textareaId = useId();

  const [ciphertext, setCiphertext] = useState('ERQMRXU');
  const [language, setLanguage] = useState<LanguageChoice>('auto');
  const [sort, setSort] = useState<SortMode>('shift');

  const analysis = useMemo(() => bruteForceCaesar(ciphertext, language), [ciphertext, language]);

  const rows: CandidateRow[] = useMemo(() => {
    const ordered =
      sort === 'shift'
        ? analysis.candidates
        : analysis.ranking.map((shift) => analysis.candidates[shift]!);
    return ordered.map((c) => ({
      id: String(c.shift),
      label: String(c.shift),
      text: c.text,
      readability: c.readability,
      rank: c.rank,
    }));
  }, [analysis, sort]);

  const bestCandidate =
    analysis.letterCount > 0 ? analysis.candidates[analysis.ranking[0]!] : undefined;

  return (
    <LabShell
      form={
        <LabParamsCard title={t('cryptanalysis.paramsTitle')}>
          <div className="flex flex-col gap-2">
            <Label htmlFor={textareaId}>{t('cryptanalysis.ciphertextLabel')}</Label>
            <Textarea
              id={textareaId}
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              rows={3}
              spellCheck={false}
              autoComplete="off"
              placeholder={t('cryptanalysis.ciphertextPlaceholder')}
              className="font-mono text-base md:text-sm"
            />
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {t('cryptanalysis.letterCount', { count: analysis.letterCount })}
            </p>
          </div>

          <div
            role="group"
            aria-label={t('cryptanalysis.examplesLabel')}
            className="flex flex-wrap gap-2"
          >
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setCiphertext('ERQMRXU')}
            >
              {t('cryptanalysis.caesar.examples.td1')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setCiphertext('LEHTLU')}
            >
              {t('cryptanalysis.caesar.examples.td2')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setCiphertext(LONG_CIPHERTEXT)}
            >
              {t('cryptanalysis.caesar.examples.long')}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('cryptanalysis.language.label')}</Label>
            <SegmentedToggle<LanguageChoice>
              value={language}
              onChange={setLanguage}
              groupLabel={t('cryptanalysis.language.label')}
              options={[
                { value: 'auto', label: t('cryptanalysis.language.auto') },
                { value: 'fr', label: t('cryptanalysis.language.fr') },
                { value: 'en', label: t('cryptanalysis.language.en') },
              ]}
            />
          </div>
        </LabParamsCard>
      }
      stage={
        analysis.letterCount === 0 ? (
          <StagePlaceholder message={t('cryptanalysis.caesar.empty')} />
        ) : (
          <>
            <SegmentedToggle<SortMode>
              value={sort}
              onChange={setSort}
              groupLabel={t('cryptanalysis.sort.label')}
              options={[
                { value: 'shift', label: t('cryptanalysis.sort.byShift') },
                { value: 'readability', label: t('cryptanalysis.sort.byReadability') },
              ]}
            />
            <CandidateTable
              rows={rows}
              caption={t('cryptanalysis.caesar.table.caption')}
              labelHeader={t('cryptanalysis.caesar.table.shift')}
              textHeader={t('cryptanalysis.caesar.table.text')}
              readabilityHeader={t('cryptanalysis.readability')}
              rankLabel={(rank) => t('cryptanalysis.rank', { rank })}
            />
          </>
        )
      }
      details={
        <>
          {bestCandidate && (
            <BestGuess
              heading={t('cryptanalysis.best.heading')}
              guess={t('cryptanalysis.caesar.best.value', { shift: bestCandidate.shift })}
              text={bestCandidate.text}
              meta={t('cryptanalysis.best.language', {
                language: t(`cryptanalysis.language.${bestCandidate.language}`),
              })}
              note={
                analysis.confidence === 'enough'
                  ? t('cryptanalysis.confidence.enough')
                  : t('cryptanalysis.confidence.limited')
              }
              confident={analysis.confidence === 'enough'}
            />
          )}

          <Card className="gap-3 py-4">
            <CardContent className="px-4">
              <p className="text-sm text-muted-foreground">{t('cryptanalysis.caesar.explain')}</p>
            </CardContent>
          </Card>

          <div>
            <Button asChild variant="ghost" className="min-h-11">
              <Link to={labPath('caesar')}>
                <ArrowLeft className="size-5" aria-hidden="true" />
                {t('cryptanalysis.links.backToLab')}
              </Link>
            </Button>
          </div>
        </>
      }
    />
  );
}
