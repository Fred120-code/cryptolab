import { useEffect } from 'react';

/**
 * Met à jour le titre du document HTML (`document.title`) en fonction du titre de page fourni.
 *
 * Pour l'accueil (`isHome: true`), le titre est fixé à "CryptoLab".
 * Pour les autres pages, le titre est suffixé par " · CryptoLab".
 *
 * @param title Titre traduit de la page courante.
 * @param isHome Indique s'il s'agit de la page d'accueil.
 */
export function useDocumentTitle(title: string, isHome: boolean = false): void {
  useEffect(() => {
    if (isHome) {
      document.title = 'CryptoLab';
    } else {
      document.title = `${title} · CryptoLab`;
    }
  }, [title, isHome]);
}
