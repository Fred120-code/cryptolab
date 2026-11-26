import { useId, type JSX } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Propriétés attendues par le composant `BestGuess`.
 */
export interface BestGuessProps {
  /** Titre du panneau */
  heading: string;
  /** Résumé de l'hypothèse retenue (ex. « Décalage 3 ») */
  guess: string;
  /** Texte déchiffré correspondant à la meilleure hypothèse */
  text: string;
  /** Note explicative sur le niveau de confiance */
  note: string;
  /** Indique si l'hypothèse se détache nettement */
  confident: boolean;
  /** Information complémentaire optionnelle (ex. langue reconnue) */
  meta?: string;
}

/**
 * Carte présentant l'hypothèse de déchiffrement la plus probable et son niveau de confiance.
 *
 * L'information de confiance est portée à la fois par une icône (`CheckCircle2` ou `Info`)
 * et par le texte explicatif, sans jamais reposer sur la couleur seule.
 *
 * @param props Propriétés incluant le titre, l'hypothèse, le texte déchiffré et la note de confiance.
 */
export function BestGuess({
  heading,
  guess,
  text,
  note,
  confident,
  meta,
}: BestGuessProps): JSX.Element {
  const headingId = useId();

  return (
    <Card role="region" aria-labelledby={headingId} className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle id={headingId} className="text-base">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        <p className="text-lg font-semibold">{guess}</p>
        <p className="font-mono text-base break-words">{text}</p>
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        <div className="flex items-start gap-2 text-sm">
          {confident ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{note}</span>
        </div>
      </CardContent>
    </Card>
  );
}
