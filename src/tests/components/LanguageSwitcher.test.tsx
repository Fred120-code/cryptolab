import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('affiche le groupe de boutons avec les labels accessibles et les textes visibles', () => {
    render(<LanguageSwitcher />);

    const group = screen.getByRole('group', { name: 'Langue' });
    expect(group).toBeInTheDocument();

    const frButton = screen.getByRole('button', { name: 'Français' });
    const enButton = screen.getByRole('button', { name: 'English' });

    expect(frButton).toHaveTextContent('FR');
    expect(enButton).toHaveTextContent('EN');
    expect(frButton).toHaveAttribute('lang', 'fr');
    expect(enButton).toHaveAttribute('lang', 'en');
  });

  it('indique la langue active avec aria-pressed et met à jour au clic', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const frButton = screen.getByRole('button', { name: 'Français' });
    const enButton = screen.getByRole('button', { name: 'English' });

    expect(frButton).toHaveAttribute('aria-pressed', 'true');
    expect(enButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(enButton);

    expect(i18n.language).toBe('en');
    expect(frButton).toHaveAttribute('aria-pressed', 'false');
    expect(enButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('permet la navigation au clavier (Tabulation et sélection Entrée/Espace)', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const frButton = screen.getByRole('button', { name: 'Français' });
    const enButton = screen.getByRole('button', { name: 'English' });

    await user.tab();
    expect(frButton).toHaveFocus();

    await user.tab();
    expect(enButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(i18n.language).toBe('en');
    expect(enButton).toHaveAttribute('aria-pressed', 'true');
  });
});
