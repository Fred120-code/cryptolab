import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('affiche le titre CryptoLab', async () => {
    render(<App />);
    expect(await screen.findByText('CryptoLab')).toBeInTheDocument();
  });
});
