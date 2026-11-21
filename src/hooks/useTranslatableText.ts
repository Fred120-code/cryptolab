import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TranslatableText } from '@/types';

/**
 * Hook permettant de traduire un objet {@link TranslatableText} émis par le moteur cryptographique.
 *
 * Utilise la clé et les paramètres d'interpolation fournis. Si la clé est introuvable,
 * elle est retournée telle quelle (comportement standard d'i18next).
 *
 * @returns Une fonction `tt` prenant un `TranslatableText` et retournant le texte traduit.
 */
export function useTranslatableText(): (text: TranslatableText) => string {
  const { t } = useTranslation();

  return useCallback(
    (text: TranslatableText): string => {
      return t(text.key, text.params);
    },
    [t],
  );
}
