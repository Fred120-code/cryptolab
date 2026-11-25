import type { JSX, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Propriétés attendues par le composant `LabParamsCard`.
 */
export interface LabParamsCardProps {
  /** Champs de configuration du laboratoire */
  children: ReactNode;
}

/**
 * Carte conteneur pour les paramètres d'un laboratoire cryptographique.
 *
 * @param props Propriétés incluant les champs enfants.
 */
export function LabParamsCard({ children }: LabParamsCardProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">{t('lab.paramsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">{children}</CardContent>
    </Card>
  );
}
