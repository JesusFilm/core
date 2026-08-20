import { hasFlag } from './cliFlags'

describe('hasFlag', () => {
  it('returns true when the flag is present', () => {
    expect(hasFlag(['node', 'script.js', '--apply'], 'apply')).toBe(true)
  })

  it('returns false when the flag is absent', () => {
    expect(hasFlag(['node', 'script.js'], 'apply')).toBe(false)
  })

  it('does not match a differently named flag', () => {
    expect(hasFlag(['node', 'script.js', '--applyOnly'], 'apply')).toBe(false)
  })
})
