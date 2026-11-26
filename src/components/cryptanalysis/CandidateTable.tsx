import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Ligne de candidat affichée dans `CandidateTable`.
 */
export interface CandidateRow {
  /** Identifiant unique de la ligne */
  id: string;
  /** Libellé de clé ou de décalage */
  label: string;
  /** Texte déchiffré candidat */
  text: string;
  /** Indice de lisibilité entre 0 et 100 */
  readability: number;
  /** Rang dans le classement (1 = meilleur) */
  rank: number;
}

/**
 * Propriétés attendues par le composant `CandidateTable`.
 */
export interface CandidateTableProps<TRow extends CandidateRow = CandidateRow> {
  /** Liste des candidats à afficher */
  rows: readonly TRow[];
  /** Légende accessible décrivant le tableau */
  caption: string;
  /** En-tête de la colonne des clés / décalages */
  labelHeader: string;
  /** En-tête de la colonne des textes obtenus */
  textHeader: string;
  /** En-tête de la colonne de lisibilité */
  readabilityHeader: string;
  /** Fonction formatant le badge de rang (ex. « Hypothèse n°1 ») */
  rankLabel: (rank: number) => string;
  /** Nombre de meilleurs candidats mis en avant (défaut : 3) */
  topCount?: number;
}

/**
 * Tableau défilant et accessible présentant les hypothèses de déchiffrement classées par lisibilité.
 *
 * Utilise un élément `<table>` natif dans un conteneur `role="region"` focusable au clavier
 * afin de préserver l'en-tête collant (`sticky top-0`) et la sémantique de tableau.
 *
 * @param props Propriétés incluant les lignes, les en-têtes traduits et le formateur de rang.
 */
export function CandidateTable<TRow extends CandidateRow = CandidateRow>({
  rows,
  caption,
  labelHeader,
  textHeader,
  readabilityHeader,
  rankLabel,
  topCount = 3,
}: CandidateTableProps<TRow>): JSX.Element {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="max-h-[60svh] overflow-y-auto rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky top-0 z-10 border-b border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
            >
              {labelHeader}
            </th>
            <th
              scope="col"
              className="sticky top-0 z-10 border-b border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
            >
              {textHeader}
            </th>
            <th
              scope="col"
              className="sticky top-0 z-10 border-b border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
            >
              {readabilityHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isTop = row.rank <= topCount;
            return (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border',
                  isTop ? 'bg-muted/40 font-medium' : 'text-muted-foreground',
                )}
              >
                <td className="px-3 py-2 align-top font-mono tabular-nums">
                  <div>{row.label}</div>
                  {isTop && (
                    <Badge variant={row.rank === 1 ? 'default' : 'secondary'} className="mt-1">
                      {rankLabel(row.rank)}
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2 align-top font-mono break-all">{row.text}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="block h-1.5 w-16 rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-highlight"
                        style={{ width: `${row.readability}%` }}
                      />
                    </span>
                    <span className="text-xs tabular-nums">{row.readability}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
