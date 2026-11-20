import { describe, expect, it } from 'vitest';
import { playerReducer, type PlayerState } from '@/hooks/usePlayer/playerReducer';

describe('playerReducer', () => {
  const baseState: PlayerState = {
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
    totalSteps: 5,
  };

  describe('play & pause & toggle', () => {
    it('démarre la lecture si totalSteps > 1', () => {
      const state = playerReducer(baseState, { type: 'play' });
      expect(state.isPlaying).toBe(true);
      expect(state.currentIndex).toBe(0);
    });

    it('est sans effet si totalSteps <= 1', () => {
      const state0 = playerReducer({ ...baseState, totalSteps: 0 }, { type: 'play' });
      expect(state0.isPlaying).toBe(false);

      const state1 = playerReducer({ ...baseState, totalSteps: 1 }, { type: 'play' });
      expect(state1.isPlaying).toBe(false);
    });

    it('repart de 0 si play est déclenché sur la dernière étape', () => {
      const lastState: PlayerState = { ...baseState, currentIndex: 4, isPlaying: false };
      const state = playerReducer(lastState, { type: 'play' });
      expect(state.currentIndex).toBe(0);
      expect(state.isPlaying).toBe(true);
    });

    it('met en pause avec pause', () => {
      const playingState: PlayerState = { ...baseState, isPlaying: true };
      const state = playerReducer(playingState, { type: 'pause' });
      expect(state.isPlaying).toBe(false);
    });

    it('bascule avec toggle selon les mêmes règles que play / pause', () => {
      // De pause à play
      const s1 = playerReducer(baseState, { type: 'toggle' });
      expect(s1.isPlaying).toBe(true);

      // De play à pause
      const s2 = playerReducer(s1, { type: 'toggle' });
      expect(s2.isPlaying).toBe(false);

      // Toggle sur la dernière étape repart de 0
      const atEnd: PlayerState = { ...baseState, currentIndex: 4, isPlaying: false };
      const s3 = playerReducer(atEnd, { type: 'toggle' });
      expect(s3.currentIndex).toBe(0);
      expect(s3.isPlaying).toBe(true);

      // Toggle avec totalSteps <= 1 reste sans effet
      const single = playerReducer({ ...baseState, totalSteps: 1 }, { type: 'toggle' });
      expect(single.isPlaying).toBe(false);
    });
  });

  describe('navigation: next, previous, goTo, restart', () => {
    it('avance avec next et met en pause', () => {
      const state = playerReducer(
        { ...baseState, isPlaying: true, currentIndex: 2 },
        { type: 'next' },
      );
      expect(state.currentIndex).toBe(3);
      expect(state.isPlaying).toBe(false);
    });

    it('borne next au maximum (totalSteps - 1)', () => {
      const state = playerReducer({ ...baseState, currentIndex: 4 }, { type: 'next' });
      expect(state.currentIndex).toBe(4);
    });

    it('recule avec previous et met en pause', () => {
      const state = playerReducer(
        { ...baseState, isPlaying: true, currentIndex: 2 },
        { type: 'previous' },
      );
      expect(state.currentIndex).toBe(1);
      expect(state.isPlaying).toBe(false);
    });

    it('borne previous au minimum (0)', () => {
      const state = playerReducer({ ...baseState, currentIndex: 0 }, { type: 'previous' });
      expect(state.currentIndex).toBe(0);
    });

    it('ne plante pas et ne change rien si totalSteps = 0 sur next ou previous', () => {
      const emptyState: PlayerState = {
        currentIndex: 0,
        isPlaying: false,
        speed: 1,
        totalSteps: 0,
      };
      expect(playerReducer(emptyState, { type: 'next' }).currentIndex).toBe(0);
      expect(playerReducer(emptyState, { type: 'previous' }).currentIndex).toBe(0);
    });

    it('déplace vers un index précis avec goTo et met en pause', () => {
      const state = playerReducer({ ...baseState, isPlaying: true }, { type: 'goTo', index: 3 });
      expect(state.currentIndex).toBe(3);
      expect(state.isPlaying).toBe(false);
    });

    it('borne goTo aux limites [0, totalSteps - 1]', () => {
      const clampedLow = playerReducer(baseState, { type: 'goTo', index: -5 });
      expect(clampedLow.currentIndex).toBe(0);

      const clampedHigh = playerReducer(baseState, { type: 'goTo', index: 99 });
      expect(clampedHigh.currentIndex).toBe(4);
    });

    it('ignore goTo avec NaN ou flottant', () => {
      const state1 = playerReducer({ ...baseState, currentIndex: 2 }, { type: 'goTo', index: NaN });
      expect(state1.currentIndex).toBe(2);

      const state2 = playerReducer({ ...baseState, currentIndex: 2 }, { type: 'goTo', index: 1.5 });
      expect(state2.currentIndex).toBe(2);
    });

    it('réinitialise à l’étape 0 et pause avec restart', () => {
      const state = playerReducer(
        { ...baseState, currentIndex: 3, isPlaying: true },
        { type: 'restart' },
      );
      expect(state.currentIndex).toBe(0);
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('setSpeed', () => {
    it('met à jour la vitesse si elle est présente dans SPEEDS', () => {
      const state = playerReducer(
        { ...baseState, isPlaying: true },
        { type: 'setSpeed', speed: 2 },
      );
      expect(state.speed).toBe(2);
      expect(state.isPlaying).toBe(true); // ne modifie pas isPlaying
    });

    it('ignore les vitesses absentes de SPEEDS', () => {
      const state = playerReducer(baseState, { type: 'setSpeed', speed: 7 });
      expect(state.speed).toBe(1);
    });
  });

  describe('tick', () => {
    it('avance d’une étape et reste en lecture si ce n’est pas la dernière étape', () => {
      const state = playerReducer(
        { ...baseState, currentIndex: 1, isPlaying: true },
        { type: 'tick' },
      );
      expect(state.currentIndex).toBe(2);
      expect(state.isPlaying).toBe(true);
    });

    it('avance et met isPlaying à false si la nouvelle étape est la dernière', () => {
      // 5 étapes : indices 0..4. currentIndex = 3 -> nextIndex = 4 (dernière)
      const state = playerReducer(
        { ...baseState, currentIndex: 3, isPlaying: true },
        { type: 'tick' },
      );
      expect(state.currentIndex).toBe(4);
      expect(state.isPlaying).toBe(false);
    });

    it('met isPlaying à false si tick survient alors qu’on est déjà sur la dernière étape', () => {
      const state = playerReducer(
        { ...baseState, currentIndex: 4, isPlaying: true },
        { type: 'tick' },
      );
      expect(state.currentIndex).toBe(4);
      expect(state.isPlaying).toBe(false);
    });

    it('gère tick avec totalSteps = 0', () => {
      const state = playerReducer(
        { currentIndex: 0, isPlaying: true, speed: 1, totalSteps: 0 },
        { type: 'tick' },
      );
      expect(state.isPlaying).toBe(false);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('remet l’index à 0, pause, met à jour totalSteps et conserve la vitesse', () => {
      const state = playerReducer(
        { currentIndex: 3, isPlaying: true, speed: 2, totalSteps: 5 },
        { type: 'reset', totalSteps: 10 },
      );
      expect(state.currentIndex).toBe(0);
      expect(state.isPlaying).toBe(false);
      expect(state.speed).toBe(2);
      expect(state.totalSteps).toBe(10);
    });
  });
});
