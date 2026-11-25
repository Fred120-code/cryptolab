import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Carte de remplacement affichée dans la zone de visualisation lorsque les paramètres sont invalides.
 */
export function StagePlaceholder(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-4">
      <CardContent className="px-4">
        <div className="flex min-h-48 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">{t('lab.stagePlaceholder')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
