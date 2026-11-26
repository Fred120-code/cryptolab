import type { JSX, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Propriétés attendues par le composant `LabParamsCard`.
 */
export interface LabParamsCardProps {
  /** Action optionnelle affichée à droite du titre (ex. sélecteur de mode) */
  action?: ReactNode;
  /** Champs de configuration du laboratoire */
  children: ReactNode;
}

/**
 * Carte conteneur pour les paramètres d'un laboratoire cryptographique.
 *
 * @param props Propriétés incluant l'action d'en-tête optionnelle et les champs enfants.
 */
export function LabParamsCard({ action, children }: LabParamsCardProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 px-4">
        <CardTitle className="text-base">{t('lab.paramsTitle')}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">{children}</CardContent>
    </Card>
  );
}
