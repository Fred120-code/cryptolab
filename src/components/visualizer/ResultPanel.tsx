import { useEffect, useRef, useState, type JSX } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OperationMode } from '@/types';

/**
 * Plage d'indices délimitant un sous-segment de texte en unités UTF-16.
 */
export interface TextRange {
  /** Indice de départ (inclus, basé sur 0) */
  start: number;
  /** Indice de fin (exclu, basé sur 0) */
  end: number;
}

/**
 * Propriétés attendues par le composant `ResultPanel`.
 */
export interface ResultPanelProps {
  /** Texte source en entrée */
  input: string;
  /** Texte produit en sortie */
  output: string;
  /** Mode d'opération cryptographique actif (chiffrement ou déchiffrement) */
  mode: OperationMode;
  /** Plage de surbrillance pour le texte d'entrée */
  inputRange?: TextRange;
  /** Plage de surbrillance pour le texte de sortie */
  outputRange?: TextRange;
}

/**
 * Rendu d'une chaîne de caractères découpée par points de code avec gestion
 * du décalage en unités de code UTF-16 et mise en valeur contextuelle.
 *
 * @param text - Texte à afficher.
 * @param range - Plage de mise en valeur éventuelle.
 * @returns Élément de paragraphe stylisé.
 */
function renderHighlightedText(text: string, range?: TextRange): JSX.Element {
  if (!text) {
    return <span className="font-mono text-muted-foreground">—</span>;
  }

  let utf16Offset = 0;
  const chars = Array.from(text);

  return (
    <p className="font-mono text-lg tracking-wide whitespace-pre-wrap break-words">
      {chars.map((char, index) => {
        const charLength = char.length;
        const startOffset = utf16Offset;
        const endOffset = utf16Offset + charLength;
        utf16Offset += charLength;

        let className = 'text-foreground';
        if (range !== undefined) {
          if (startOffset >= range.start && endOffset <= range.end) {
            className = 'bg-primary text-primary-foreground rounded px-0.5';
          } else if (endOffset <= range.start) {
            className = 'text-foreground';
          } else {
            className = 'text-muted-foreground';
          }
        }

        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </p>
  );
}

/**
 * Panneau d'affichage du résultat complet d'une opération cryptographique.
 *
 * Présente le texte original et le texte transformé avec surbrillance synchronisée
 * de l'étape courante et bouton de copie vers le presse-papiers accessible.
 *
 * @param props - Propriétés incluant les textes d'entrée/sortie, le mode et les plages actives.
 */
export function ResultPanel({
  input,
  output,
  mode,
  inputRange,
  outputRange,
}: ResultPanelProps): JSX.Element {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (): Promise<void> => {
    if (!output) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopyError(false);

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API non disponible');
      }
      await navigator.clipboard.writeText(output);
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
    <Card role="region" aria-labelledby="result-panel-title">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <CardTitle id="result-panel-title">{t('visualizer.result.title')}</CardTitle>
        <div className="flex flex-col items-end gap-1">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={!output}
            onClick={() => void handleCopy()}
          >
            {copied ? (
              <Check className="size-5" aria-hidden="true" />
            ) : (
              <Copy className="size-5" aria-hidden="true" />
            )}
            <span>{copied ? t('visualizer.result.copied') : t('visualizer.result.copy')}</span>
          </Button>
          <p aria-live="polite" className="sr-only">
            {copied ? t('visualizer.result.copied') : ''}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {copyError && (
          <p role="alert" className="text-sm text-destructive">
            {t('visualizer.result.copyFailed')}
          </p>
        )}

        {/* Bloc texte original */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">
            {t('visualizer.result.original')}
          </span>
          {renderHighlightedText(input, inputRange)}
        </div>

        {/* Bloc texte obtenu (chiffré ou déchiffré) */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">
            {mode === 'encrypt'
              ? t('visualizer.result.encrypted')
              : t('visualizer.result.decrypted')}
          </span>
          {renderHighlightedText(output, outputRange)}
        </div>
      </CardContent>
    </Card>
  );
}
