import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

describe('shadcn ui setup', () => {
  it('rend un composant Button et réagit au clic', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button type="button" onClick={handleClick}>
        Action
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fusionne correctement les classes Tailwind conflictuelles via cn', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
