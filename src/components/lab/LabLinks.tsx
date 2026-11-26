import type { JSX } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cryptanalysisPath, docsPath } from '@/config/routes';
import type { AlgorithmId } from '@/types';

/**
 * Propriétés attendues par le composant `LabLinks`.
 */
export interface LabLinksProps {
  /** Identifiant de l'algorithme courant */
  algorithm: AlgorithmId;
}

/**
 * Liens contextuels du laboratoire vers la documentation et la cryptanalyse de l'algorithme.
 *
 * @param props Propriétés incluant l'identifiant de l'algorithme.
 */
export function LabLinks({ algorithm }: LabLinksProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('lab.links.label')} className="flex flex-wrap gap-2">
      <Button asChild variant="ghost" className="min-h-11">
        <Link to={docsPath(algorithm)}>
          <BookOpen className="size-5" aria-hidden="true" />
          {t('lab.links.docs')}
        </Link>
      </Button>
      <Button asChild variant="ghost" className="min-h-11">
        <Link to={cryptanalysisPath(algorithm)}>
          <Search className="size-5" aria-hidden="true" />
          {t('lab.links.cryptanalysis')}
        </Link>
      </Button>
    </nav>
  );
}
