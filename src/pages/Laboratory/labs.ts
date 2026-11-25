import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { AlgorithmId } from '@/types';

/**
 * Registre des composants de laboratoire chargés paresseusement par algorithme.
 */
export const LABS: Record<AlgorithmId, LazyExoticComponent<ComponentType>> = {
  caesar: lazy(() => import('./CaesarPlayground').then((m) => ({ default: m.CaesarPlayground }))),
  substitution: lazy(() =>
    import('./SubstitutionPlayground').then((m) => ({ default: m.SubstitutionPlayground })),
  ),
  permutation: lazy(() =>
    import('./PermutationPlayground').then((m) => ({ default: m.PermutationPlayground })),
  ),
  vigenere: lazy(() =>
    import('./VigenerePlayground').then((m) => ({ default: m.VigenerePlayground })),
  ),
};
