import { isAlgorithmId } from '@/config/algorithms';
import type { AlgorithmId } from '@/types';

/**
 * Clé de stockage dans localStorage pour l'historique d'activité.
 */
export const ACTIVITY_STORAGE_KEY = 'cryptolab:activity';

/**
 * Nombre maximum d'entrées conservées dans l'historique.
 */
export const MAX_ENTRIES = 20;

/**
 * Fenêtre de déduplication en millisecondes (5 minutes).
 * Une nouvelle entrée avec le même couple (kind, algorithm) remplace la précédente
 * si elle survient dans cet intervalle.
 */
export const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

/**
 * Types d'activité enregistrables.
 */
export const ACTIVITY_KINDS = ['lab', 'docs', 'cryptanalysis', 'exercise'] as const;

/**
 * Type d'activité enregistrable dans l'historique.
 */
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/**
 * Entrée individuelle de l'historique d'activité.
 * Règle de confidentialité : seuls le type, l'algorithme et l'horodatage sont stockés.
 */
export interface ActivityEntry {
  kind: ActivityKind;
  algorithm: AlgorithmId;
  at: number;
}

/**
 * Tableau vide gelé, utilisé comme valeur par défaut côté serveur (SSR).
 */
export const EMPTY_ACTIVITY: readonly ActivityEntry[] = Object.freeze([]);

/**
 * Parse le contenu brut du localStorage en un tableau d'entrées valides.
 * Ne lève jamais d'exception.
 *
 * @param raw Chaîne brute lue depuis le localStorage (peut être `null`).
 * @returns Tableau d'entrées valides, triées par date décroissante, tronqué à {@link MAX_ENTRIES}.
 */
export function parseActivity(raw: string | null): ActivityEntry[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('entries' in parsed)) return [];
    const obj = parsed as { version?: unknown; entries?: unknown };
    if (obj.version !== 1 || !Array.isArray(obj.entries)) return [];

    const valid: ActivityEntry[] = [];
    for (const entry of obj.entries as unknown[]) {
      if (typeof entry !== 'object' || entry === null) continue;
      const e = entry as Record<string, unknown>;
      if (
        typeof e.kind !== 'string' ||
        !(ACTIVITY_KINDS as readonly string[]).includes(e.kind) ||
        !isAlgorithmId(e.algorithm) ||
        typeof e.at !== 'number' ||
        !Number.isFinite(e.at)
      ) {
        continue;
      }
      valid.push({ kind: e.kind as ActivityKind, algorithm: e.algorithm, at: e.at });
    }

    valid.sort((a, b) => b.at - a.at);
    return valid.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

/**
 * Ajoute une entrée à l'historique d'activité (fonction pure).
 * Si la première entrée existante a le même couple (kind, algorithm) et que l'écart
 * temporel est inférieur à {@link DEDUPE_WINDOW_MS}, elle est remplacée.
 *
 * @param entries Historique existant.
 * @param entry Nouvelle entrée à ajouter.
 * @returns Nouvel historique tronqué à {@link MAX_ENTRIES}.
 */
export function addActivity(
  entries: readonly ActivityEntry[],
  entry: ActivityEntry,
): ActivityEntry[] {
  const first = entries[0];
  if (
    first &&
    first.kind === entry.kind &&
    first.algorithm === entry.algorithm &&
    entry.at - first.at < DEDUPE_WINDOW_MS
  ) {
    return [entry, ...entries.slice(1)].slice(0, MAX_ENTRIES);
  }
  return [entry, ...entries].slice(0, MAX_ENTRIES);
}

/**
 * Retourne les entrées les plus récentes en ne gardant qu'une seule occurrence
 * par couple (kind, algorithm), dans l'ordre chronologique décroissant.
 *
 * @param entries Historique complet (déjà trié par date décroissante).
 * @param limit Nombre maximum d'entrées à retourner.
 * @returns Sous-ensemble dédupliqué et limité.
 */
export function latestUnique(entries: readonly ActivityEntry[], limit: number): ActivityEntry[] {
  const seen = new Set<string>();
  const result: ActivityEntry[] = [];
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.algorithm}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
    if (result.length >= limit) break;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Magasin externe pour useSyncExternalStore
// ---------------------------------------------------------------------------

type Listener = () => void;

const listeners = new Set<Listener>();
let lastRaw: string | null = null;
let lastParsed: ActivityEntry[] = [];

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key === ACTIVITY_STORAGE_KEY || event.key === null) {
    notifyListeners();
  }
}

/**
 * Souscrit aux changements de l'historique d'activité.
 *
 * @param callback Fonction appelée à chaque modification.
 * @returns Fonction de désabonnement.
 */
export function subscribe(callback: Listener): () => void {
  listeners.add(callback);
  if (listeners.size === 1) {
    window.addEventListener('storage', handleStorageEvent);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/**
 * Lit l'historique d'activité depuis le localStorage.
 * Retourne la même référence tant que la chaîne brute est identique
 * (évite les boucles infinies de rendus avec useSyncExternalStore).
 *
 * @returns Tableau d'entrées d'activité.
 */
export function getSnapshot(): ActivityEntry[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseActivity(raw);
  }
  return lastParsed;
}

function writeEntries(entries: ActivityEntry[]): void {
  try {
    const value = JSON.stringify({ version: 1, entries });
    localStorage.setItem(ACTIVITY_STORAGE_KEY, value);
  } catch {
    // Stockage indisponible ou plein : échec silencieux.
  }
  notifyListeners();
}

/**
 * Enregistre une activité dans l'historique.
 *
 * @param kind Type d'activité.
 * @param algorithm Identifiant de l'algorithme.
 */
export function recordActivity(kind: ActivityKind, algorithm: AlgorithmId): void {
  const current = getSnapshot();
  const updated = addActivity(current, { kind, algorithm, at: Date.now() });
  writeEntries(updated);
}

/**
 * Efface la totalité de l'historique d'activité.
 */
export function clearActivity(): void {
  try {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  } catch {
    // Stockage indisponible : échec silencieux.
  }
  lastRaw = null;
  lastParsed = [];
  notifyListeners();
}
