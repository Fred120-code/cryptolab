/**
 * Formate un horodatage en temps relatif lisible selon la locale donnée.
 *
 * @param timestamp Horodatage à formater (en millisecondes depuis l'époque Unix).
 * @param now Horodatage de référence « maintenant ».
 * @param locale Code de langue BCP 47 (ex. 'fr', 'en').
 * @returns Chaîne de temps relatif localisée.
 */
export function formatRelativeTime(timestamp: number, now: number, locale: string): string {
  const diffMs = now - timestamp;
  const absDiffSec = Math.abs(diffMs) / 1000;

  if (absDiffSec < 45) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second');
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });

  if (absDiffSec < 3600) {
    const minutes = Math.max(1, Math.floor(absDiffSec / 60));
    return rtf.format(-minutes, 'minute');
  }

  if (absDiffSec < 86400) {
    const hours = Math.max(1, Math.floor(absDiffSec / 3600));
    return rtf.format(-hours, 'hour');
  }

  const absDiffDays = absDiffSec / 86400;
  if (absDiffDays < 7) {
    const days = Math.max(1, Math.floor(absDiffDays));
    return rtf.format(-days, 'day');
  }

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(timestamp);
}
