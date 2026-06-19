import { isSafeRelativePath } from './isSafeRelativePath'

describe('isSafeRelativePath', () => {
  it('should return true for valid relative paths', () => {
    expect(isSafeRelativePath('/')).toBe(true)
    expect(isSafeRelativePath('/teams/123/integrations')).toBe(true)
    expect(isSafeRelativePath('/journeys?openSyncDialog=true')).toBe(true)
  })

  it('should return false for undefined', () => {
    expect(isSafeRelativePath(undefined)).toBe(false)
  })

  it('should return false for paths not starting with /', () => {
    expect(isSafeRelativePath('')).toBe(false)
    expect(isSafeRelativePath('teams/123')).toBe(false)
    expect(isSafeRelativePath('https://evil.com')).toBe(false)
  })

  it('should return false for protocol-relative URLs', () => {
    expect(isSafeRelativePath('//evil.com')).toBe(false)
    expect(isSafeRelativePath('//evil.com/path')).toBe(false)
  })
})
