import { useEffect, useSyncExternalStore } from 'react';
import type { AlgorithmId } from '@/types';
import {
  clearActivity,
  EMPTY_ACTIVITY,
  getSnapshot,
  recordActivity,
  subscribe,
  type ActivityEntry,
  type ActivityKind,
} from '@/lib/activity';

/**
 * Hook fournissant l'historique d'activité et la possibilité de l'effacer.
 *
 * @returns `entries` : liste des entrées ; `clear` : efface l'historique.
 */
export function useActivity(): { entries: readonly ActivityEntry[]; clear: () => void } {
  const entries = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_ACTIVITY as ActivityEntry[],
  );
  return { entries, clear: clearActivity };
}

/**
 * Enregistre une visite dans l'historique d'activité lorsque l'algorithme est défini.
 * Doit être appelé inconditionnellement en haut du composant (règle des hooks).
 *
 * @param kind Type d'activité.
 * @param algorithm Identifiant de l'algorithme, ou `undefined` si le paramètre d'URL est invalide.
 */
export function useRecordVisit(kind: ActivityKind, algorithm: AlgorithmId | undefined): void {
  useEffect(() => {
    if (algorithm !== undefined) {
      recordActivity(kind, algorithm);
    }
  }, [kind, algorithm]);
}
