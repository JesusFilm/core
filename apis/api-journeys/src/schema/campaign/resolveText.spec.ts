import { resolveText } from './resolveText'

describe('resolveText', () => {
  const translations = {
    '496': { value: 'Bonjour', source: 'human' },
    '21028': { value: '', source: 'machine' }
  }

  it('returns the requested language translation when one is stored', () => {
    expect(resolveText('Hello', translations, '496')).toBe('Bonjour')
  })

  it('falls back to the default-language column when the language has no entry', () => {
    expect(resolveText('Hello', translations, '1106')).toBe('Hello')
  })

  it('falls back to the default-language column when the stored translation is empty', () => {
    expect(resolveText('Hello', translations, '21028')).toBe('Hello')
  })

  it('returns the column for the default language itself', () => {
    expect(resolveText('Hello', translations, '529')).toBe('Hello')
  })

  it('falls back to empty when both the translation and the column are missing', () => {
    expect(resolveText(null, translations, '1106')).toBe('')
    expect(resolveText(undefined, null, '1106')).toBe('')
  })

  it('never returns a missing marker for malformed translation columns', () => {
    expect(resolveText('Hello', 'not-an-object', '496')).toBe('Hello')
    expect(resolveText('Hello', ['Bonjour'], '496')).toBe('Hello')
    expect(resolveText('Hello', { '496': { source: 'human' } }, '496')).toBe(
      'Hello'
    )
  })

  it('reads the column when no language is requested', () => {
    expect(resolveText('Hello', translations, null)).toBe('Hello')
  })
})
