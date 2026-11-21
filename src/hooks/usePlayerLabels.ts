import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerControlsLabels } from '@/components/visualizer/PlayerControls';

/**
 * Hook fournissant les libellés traduits pour les contrôles du lecteur pas à pas.
 *
 * Tous les libellés sont mémoïsés et automatiquement recalculés lors d'un changement de langue.
 *
 * @returns L'objet {@link PlayerControlsLabels} contenant les textes et fonctions de formatage traduits.
 */
export function usePlayerLabels(): PlayerControlsLabels {
  const { t, i18n } = useTranslation();

  return useMemo((): PlayerControlsLabels => {
    // Utiliser explicitement i18n.language dans le calcul pour forcer la réévaluation
    void i18n.language;
    return {
      restart: t('player.restart'),
      previous: t('player.previous'),
      play: t('player.play'),
      pause: t('player.pause'),
      next: t('player.next'),
      speed: t('player.speed'),
      progress: t('player.progress'),
      stepOf: (current: number, total: number): string => t('player.stepOf', { current, total }),
      speedOption: (speed: number): string => t('player.speedOption', { speed }),
    };
  }, [t, i18n.language]);
}
