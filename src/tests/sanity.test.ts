import { describe, expect, it } from 'vitest'

describe('sanity check', () => {
  it('additionne correctement', () => {
    expect(1 + 1).toBe(2)
  })

  it('les chaînes sont égales', () => {
    expect('CryptoLab').toBe('CryptoLab')
  })
})
