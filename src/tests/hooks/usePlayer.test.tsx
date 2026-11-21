import { act, render, renderHook } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlayer, type PlayerApi } from '@/hooks/usePlayer';
import type { ExecutionStep } from '@/types';

function createMockSteps(count: number): ExecutionStep<null>[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    input: `in_${i}`,
    output: `out_${i}`,
    calculation: `${i} + 1`,
    explanation: { key: `step.${i}` },
    data: null,
  }));
}

describe('usePlayer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initialise avec des valeurs cohérentes sans lecture automatique', () => {
    const steps = createMockSteps(5);
    const { result } = renderHook(() => usePlayer(steps));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentStep).toBe(steps[0]);
    expect(result.current.totalSteps).toBe(5);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(1);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
    expect(result.current.progress).toBe(0.2); // (0 + 1) / 5
    expect(vi.getTimerCount()).toBe(0);
  });

  it('gère un tableau d’étapes vide (totalSteps = 0)', () => {
    const { result } = renderHook(() => usePlayer([]));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentStep).toBeUndefined();
    expect(result.current.totalSteps).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(true);
    expect(result.current.progress).toBe(0);
  });

  it('avance toutes les 1200 ms à vitesse 1 et 600 ms à vitesse 2', () => {
    const steps = createMockSteps(5);
    const { result } = renderHook(() => usePlayer(steps));

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    // À 1199 ms, n'a pas encore avancé
    act(() => {
      vi.advanceTimersByTime(1199);
    });
    expect(result.current.currentIndex).toBe(0);

    // À 1200 ms, avance à l'étape 1
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.currentIndex).toBe(1);

    // Changement de vitesse à 2x
    act(() => {
      result.current.setSpeed(2);
    });
    expect(result.current.speed).toBe(2);

    // À 600 ms, avance à l'étape 2
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.currentIndex).toBe(2);
  });

  it('s’arrête automatiquement à la dernière étape', () => {
    const steps = createMockSteps(3); // indices 0, 1, 2
    const { result } = renderHook(() => usePlayer(steps));

    act(() => {
      result.current.play();
    });

    // 1200 ms -> étape 1
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isPlaying).toBe(true);

    // 1200 ms -> étape 2 (dernière étape, arrêt automatique)
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLast).toBe(true);
  });

  it('repart du début lorsque play est appelé sur la dernière étape', () => {
    const steps = createMockSteps(3);
    const { result } = renderHook(() => usePlayer(steps));

    act(() => {
      result.current.goTo(2);
    });
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.play();
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });

  it('met la lecture en pause lors de next, previous ou goTo', () => {
    const steps = createMockSteps(5);
    const { result } = renderHook(() => usePlayer(steps));

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.previous();
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.goTo(3);
    });
    expect(result.current.currentIndex).toBe(3);
    expect(result.current.isPlaying).toBe(false);
  });

  it('réinitialise lors d’un changement d’identité du tableau steps, mais pas lors d’un rerender avec le même tableau', () => {
    const stepsA = createMockSteps(4);
    const stepsB = createMockSteps(6);

    let currentSteps = stepsA;
    const { result, rerender } = renderHook(() => usePlayer(currentSteps));

    act(() => {
      result.current.goTo(2);
    });
    expect(result.current.currentIndex).toBe(2);

    // Rerender avec le même tableau (même référence)
    rerender();
    expect(result.current.currentIndex).toBe(2);

    // Rerender avec un nouveau tableau
    currentSteps = stepsB;
    rerender();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalSteps).toBe(6);
  });

  it('nettoie le minuteur au démontage pour éviter les fuites de mémoire', () => {
    const steps = createMockSteps(5);
    const { result, unmount } = renderHook(() => usePlayer(steps));

    act(() => {
      result.current.play();
    });
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('réinitialise de façon synchrone lors d’un changement de tableau de steps sans rendu intermédiaire désynchronisé', () => {
    interface RenderRecord {
      totalSteps: number;
      currentIndex: number;
      stepsLength: number;
    }

    const recordedRenders: RenderRecord[] = [];
    let playerApi!: PlayerApi<null>;

    function TestComponent({ steps }: { steps: readonly ExecutionStep<null>[] }) {
      const player = usePlayer(steps);
      playerApi = player;

      useLayoutEffect(() => {
        recordedRenders.push({
          totalSteps: player.totalSteps,
          currentIndex: player.currentIndex,
          stepsLength: steps.length,
        });
      });

      return <div>{player.currentIndex}</div>;
    }

    const stepsA = createMockSteps(4);
    const stepsB = createMockSteps(7);

    const { rerender } = render(<TestComponent steps={stepsA} />);

    act(() => {
      playerApi.goTo(2);
    });

    // Réinitialise l'historique pour capturer uniquement les rendus déclenchés par le changement de steps
    recordedRenders.length = 0;

    rerender(<TestComponent steps={stepsB} />);

    // Vérifie qu'aucun rendu validé n'a eu totalSteps !== steps.length et que currentIndex est revenu à 0
    expect(recordedRenders.length).toBeGreaterThan(0);
    for (const record of recordedRenders) {
      expect(record.totalSteps).toBe(record.stepsLength);
      expect(record.totalSteps).toBe(7);
      expect(record.currentIndex).toBe(0);
    }
  });
});
