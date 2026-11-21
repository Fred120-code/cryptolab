import { DEFAULT_SPEED, SPEEDS, type Speed } from './constants';

/**
 * État interne du lecteur d'étapes.
 */
export interface PlayerState {
  /** Index de l'étape courante (basé sur 0, dans [0, totalSteps - 1] ou 0 si totalSteps = 0) */
  currentIndex: number;
  /** Indique si la lecture automatique est active */
  isPlaying: boolean;
  /** Vitesse de lecture actuelle */
  speed: number;
  /** Nombre total d'étapes d'exécution */
  totalSteps: number;
}

/**
 * Actions possibles pour modifier l'état du lecteur.
 */
export type PlayerAction =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'toggle' }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'restart' }
  | { type: 'goTo'; index: number }
  | { type: 'setSpeed'; speed: number }
  | { type: 'tick' }
  | { type: 'reset'; totalSteps: number };

/**
 * État initial par défaut du lecteur.
 */
export const initialPlayerState: PlayerState = {
  currentIndex: 0,
  isPlaying: false,
  speed: DEFAULT_SPEED,
  totalSteps: 0,
};

/**
 * Réducteur pur pour la gestion de l'état du lecteur d'étapes d'exécution.
 *
 * @param state État courant du lecteur.
 * @param action Action à exécuter.
 * @returns Nouvel état mis à jour de façon immuable.
 */
export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'play': {
      if (state.totalSteps <= 1) {
        return state;
      }
      if (state.currentIndex >= state.totalSteps - 1) {
        return {
          ...state,
          currentIndex: 0,
          isPlaying: true,
        };
      }
      return {
        ...state,
        isPlaying: true,
      };
    }

    case 'pause': {
      return {
        ...state,
        isPlaying: false,
      };
    }

    case 'toggle': {
      if (state.isPlaying) {
        return {
          ...state,
          isPlaying: false,
        };
      }
      if (state.totalSteps <= 1) {
        return state;
      }
      if (state.currentIndex >= state.totalSteps - 1) {
        return {
          ...state,
          currentIndex: 0,
          isPlaying: true,
        };
      }
      return {
        ...state,
        isPlaying: true,
      };
    }

    case 'next': {
      if (state.totalSteps <= 0) {
        return state;
      }
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.totalSteps - 1),
        isPlaying: false,
      };
    }

    case 'previous': {
      if (state.totalSteps <= 0) {
        return state;
      }
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
        isPlaying: false,
      };
    }

    case 'restart': {
      return {
        ...state,
        currentIndex: 0,
        isPlaying: false,
      };
    }

    case 'goTo': {
      if (!Number.isSafeInteger(action.index) || state.totalSteps <= 0) {
        return state;
      }
      const clampedIndex = Math.max(0, Math.min(action.index, state.totalSteps - 1));
      return {
        ...state,
        currentIndex: clampedIndex,
        isPlaying: false,
      };
    }

    case 'setSpeed': {
      if (!SPEEDS.includes(action.speed as Speed)) {
        return state;
      }
      return {
        ...state,
        speed: action.speed,
      };
    }

    case 'tick': {
      if (state.totalSteps <= 0) {
        return state.isPlaying ? { ...state, isPlaying: false } : state;
      }
      if (state.currentIndex < state.totalSteps - 1) {
        const nextIndex = state.currentIndex + 1;
        const isLast = nextIndex === state.totalSteps - 1;
        return {
          ...state,
          currentIndex: nextIndex,
          isPlaying: isLast ? false : state.isPlaying,
        };
      }
      return {
        ...state,
        isPlaying: false,
      };
    }

    case 'reset': {
      const totalSteps =
        Number.isSafeInteger(action.totalSteps) && action.totalSteps >= 0 ? action.totalSteps : 0;
      return {
        ...state,
        currentIndex: 0,
        isPlaying: false,
        totalSteps,
      };
    }

    default:
      return state;
  }
}
