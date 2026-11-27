import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { AlgorithmId } from '@/types';

/**
 * Registre des outils de cryptanalyse chargés paresseusement par algorithme.
 */
export const CRYPTANALYSIS_TOOLS: Partial<Record<AlgorithmId, LazyExoticComponent<ComponentType>>> =
  {
    caesar: lazy(() =>
      import('./CaesarCryptanalysis').then((m) => ({ default: m.CaesarCryptanalysis })),
    ),
  };
