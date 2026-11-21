import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlayerControls, type PlayerControlsLabels } from '@/components/visualizer/PlayerControls';
import type { PlayerApi } from '@/hooks/usePlayer';

afterEach(() => {
  cleanup();
});

const mockLabels: PlayerControlsLabels = {
  restart: 'Recommencer',
  previous: 'Étape précédente',
  play: 'Lire',
  pause: 'Mettre en pause',
  next: 'Étape suivante',
  speed: 'Vitesse de lecture',
  progress: 'Progression de l’animation',
  stepOf: (current, total) => `${current} / ${total}`,
  speedOption: (speed) => `${speed}x`,
};

function createMockPlayer(overrides: Partial<PlayerApi<unknown>> = {}): PlayerApi<unknown> {
  return {
    currentIndex: 2,
    currentStep: undefined,
    totalSteps: 12,
    isPlaying: false,
    speed: 1,
    isFirst: false,
    isLast: false,
    progress: 3 / 12,
    play: vi.fn(),
    pause: vi.fn(),
    toggle: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    restart: vi.fn(),
    goTo: vi.fn(),
    setSpeed: vi.fn(),
    ...overrides,
  };
}

describe('PlayerControls component', () => {
  it('appelle la bonne action lors du clic sur chaque bouton', async () => {
    const user = userEvent.setup();
    const player = createMockPlayer();

    render(<PlayerControls player={player} labels={mockLabels} />);

    await user.click(screen.getByRole('button', { name: mockLabels.restart }));
    expect(player.restart).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: mockLabels.previous }));
    expect(player.previous).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: mockLabels.play }));
    expect(player.toggle).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: mockLabels.next }));
    expect(player.next).toHaveBeenCalledTimes(1);
  });

  it('bascule le libellé accessible du bouton central entre Lecture et Pause', () => {
    const pausedPlayer = createMockPlayer({ isPlaying: false });
    const { rerender } = render(<PlayerControls player={pausedPlayer} labels={mockLabels} />);

    expect(screen.getByRole('button', { name: mockLabels.play })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: mockLabels.pause })).not.toBeInTheDocument();

    const playingPlayer = createMockPlayer({ isPlaying: true });
    rerender(<PlayerControls player={playingPlayer} labels={mockLabels} />);

    expect(screen.getByRole('button', { name: mockLabels.pause })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: mockLabels.play })).not.toBeInTheDocument();
  });

  describe('états désactivés selon la position et le nombre d’étapes', () => {
    it('désactive Recommencer et Précédent sur la première étape', () => {
      const player = createMockPlayer({ currentIndex: 0, isFirst: true, totalSteps: 5 });
      render(<PlayerControls player={player} labels={mockLabels} />);

      expect(screen.getByRole('button', { name: mockLabels.restart })).toBeDisabled();
      expect(screen.getByRole('button', { name: mockLabels.previous })).toBeDisabled();
      expect(screen.getByRole('button', { name: mockLabels.play })).toBeEnabled();
      expect(screen.getByRole('button', { name: mockLabels.next })).toBeEnabled();
    });

    it('désactive Suivant sur la dernière étape', () => {
      const player = createMockPlayer({
        currentIndex: 4,
        isFirst: false,
        isLast: true,
        totalSteps: 5,
      });
      render(<PlayerControls player={player} labels={mockLabels} />);

      expect(screen.getByRole('button', { name: mockLabels.restart })).toBeEnabled();
      expect(screen.getByRole('button', { name: mockLabels.previous })).toBeEnabled();
      expect(screen.getByRole('button', { name: mockLabels.play })).toBeEnabled();
      expect(screen.getByRole('button', { name: mockLabels.next })).toBeDisabled();
    });

    it('désactive tous les contrôles si totalSteps = 0', () => {
      const player = createMockPlayer({
        currentIndex: 0,
        isFirst: true,
        isLast: true,
        totalSteps: 0,
      });
      render(<PlayerControls player={player} labels={mockLabels} />);

      expect(screen.getByRole('button', { name: mockLabels.restart })).toBeDisabled();
      expect(screen.getByRole('button', { name: mockLabels.previous })).toBeDisabled();
      expect(screen.getByRole('button', { name: mockLabels.play })).toBeDisabled();
      expect(screen.getByRole('button', { name: mockLabels.next })).toBeDisabled();
      expect(screen.getByRole('slider', { name: mockLabels.progress })).toBeDisabled();
      expect(screen.getByRole('combobox', { name: mockLabels.speed })).toBeDisabled();
    });

    it('désactive la lecture si totalSteps <= 1', () => {
      const player = createMockPlayer({
        currentIndex: 0,
        isFirst: true,
        isLast: true,
        totalSteps: 1,
      });
      render(<PlayerControls player={player} labels={mockLabels} />);

      expect(screen.getByRole('button', { name: mockLabels.play })).toBeDisabled();
    });
  });

  it('appelle goTo avec la valeur numérique lors du changement de curseur', () => {
    const player = createMockPlayer({ currentIndex: 1, totalSteps: 10 });
    render(<PlayerControls player={player} labels={mockLabels} />);

    const slider = screen.getByRole('slider', { name: mockLabels.progress });
    fireEvent.change(slider, { target: { value: '4' } });

    expect(player.goTo).toHaveBeenCalledWith(4);
  });

  it('appelle setSpeed avec le nombre sélectionné lors du changement de vitesse', async () => {
    const user = userEvent.setup();
    const player = createMockPlayer();
    render(<PlayerControls player={player} labels={mockLabels} />);

    const select = screen.getByRole('combobox', { name: mockLabels.speed });
    await user.selectOptions(select, '2');

    expect(player.setSpeed).toHaveBeenCalledWith(2);
  });

  it('affiche le compteur au format "3 / 12" avec la fonction stepOf', () => {
    // currentIndex = 2 => étape 3 sur 12
    const player = createMockPlayer({ currentIndex: 2, totalSteps: 12 });
    render(<PlayerControls player={player} labels={mockLabels} />);

    expect(screen.getByText('3 / 12')).toBeInTheDocument();
  });

  it('n’utilise aucun texte en dur et respecte entièrement les libellés injectés', () => {
    const customLabels: PlayerControlsLabels = {
      restart: 'BTN_RESTART',
      previous: 'BTN_PREV',
      play: 'BTN_PLAY',
      pause: 'BTN_PAUSE',
      next: 'BTN_NEXT',
      speed: 'SELECT_SPEED',
      progress: 'SLIDER_PROGRESS',
      stepOf: (c, t) => `STEP[${c}-${t}]`,
      speedOption: (s) => `V:${s}`,
    };

    const player = createMockPlayer({ currentIndex: 1, totalSteps: 8 });
    render(<PlayerControls player={player} labels={customLabels} />);

    expect(screen.getByRole('button', { name: 'BTN_RESTART' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTN_PREV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTN_PLAY' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTN_NEXT' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'SLIDER_PROGRESS' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'SELECT_SPEED' })).toBeInTheDocument();
    expect(screen.getByText('STEP[2-8]')).toBeInTheDocument();
  });
});
