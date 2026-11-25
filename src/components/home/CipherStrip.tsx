import type { JSX } from 'react';
import { ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { caesarAlgorithm } from '@/algorithms';

const SAMPLE = 'BONJOUR';
const SHIFT = 3;
const SAMPLE_OUTPUT = caesarAlgorithm.encrypt(SAMPLE, { shift: SHIFT });

/**
 * Illustration décorative du chiffrement de César sur un mot d'exemple.
 */
export function CipherStrip(): JSX.Element {
  const { t } = useTranslation();

  return (
    <figure className="flex flex-col items-center gap-3">
      <div aria-hidden="true" className="grid w-full max-w-sm grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from(SAMPLE).map((letter, i) => (
          <div
            key={`in-${i}`}
            className="flex aspect-square items-center justify-center rounded-md border border-border bg-card font-mono text-base font-medium text-foreground sm:text-lg"
          >
            {letter}
          </div>
        ))}

        {Array.from(SAMPLE).map((_, i) => (
          <div key={`arrow-${i}`} className="flex justify-center py-0.5">
            <ArrowDown className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        ))}

        {Array.from(SAMPLE_OUTPUT).map((letter, i) => (
          <div
            key={`out-${i}`}
            style={{ animationDelay: `${i * 120}ms` }}
            className="animate-letter-in motion-reduce:animate-none flex aspect-square items-center justify-center rounded-md border border-primary bg-primary font-mono text-base font-medium text-primary-foreground sm:text-lg"
          >
            {letter}
          </div>
        ))}
      </div>

      <figcaption className="text-center text-sm text-muted-foreground">
        {t('home.hero.caption', { from: SAMPLE, shift: SHIFT, to: SAMPLE_OUTPUT })}
      </figcaption>
    </figure>
  );
}
