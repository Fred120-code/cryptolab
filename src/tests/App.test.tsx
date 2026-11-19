import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '@/App'

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('affiche le titre CryptoLab', () => {
    render(<App />)
    expect(screen.getByText('CryptoLab')).toBeInTheDocument()
  })
})
