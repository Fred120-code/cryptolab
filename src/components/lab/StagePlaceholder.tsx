import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Propriétés attendues par le composant `StagePlaceholder`.
 */
export interface StagePlaceholderProps {
  /** Message personnalisé à afficher à la place du texte par défaut */
  message?: string;
}

/**
 * Carte de remplacement affichée dans la zone de visualisation lorsque les paramètres sont invalides ou incomplets.
 *
 * @param props Propriétés incluant un message optionnel.
 */
export function StagePlaceholder({ message }: StagePlaceholderProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-4">
      <CardContent className="px-4">
        <div className="flex min-h-48 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">{message ?? t('lab.stagePlaceholder')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
