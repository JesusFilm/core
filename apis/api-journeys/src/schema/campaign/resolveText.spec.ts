import { resolveText } from './resolveText'

describe('resolveText', () => {
  const ENGLISH = '529'
  const translations = {
    '496': { value: 'Bonjour', source: 'human' },
    '21028': { value: '', source: 'machine' }
  }

  it('returns the requested language translation when one is stored', () => {
    expect(resolveText('Hello', translations, '496', ENGLISH)).toBe('Bonjour')
  })

  it('falls back to the default-language column when the language has no entry', () => {
    expect(resolveText('Hello', translations, '1106', ENGLISH)).toBe('Hello')
  })

  it('falls back to the default-language column when the stored translation is empty', () => {
    expect(resolveText('Hello', translations, '21028', ENGLISH)).toBe('Hello')
  })

  it('returns the column for the default language itself', () => {
    expect(resolveText('Hello', translations, ENGLISH, ENGLISH)).toBe('Hello')
  })

  it('ignores an entry stored under the default language id', () => {
    expect(
      resolveText(
        'Hello',
        { [ENGLISH]: { value: 'Shadow', source: 'machine' } },
        ENGLISH,
        ENGLISH
      )
    ).toBe('Hello')
  })

  it('falls back to empty when both the translation and the column are missing', () => {
    expect(resolveText(null, translations, '1106', ENGLISH)).toBe('')
    expect(resolveText(undefined, null, '1106', ENGLISH)).toBe('')
  })

  it('never returns a missing marker for malformed translation columns', () => {
    expect(resolveText('Hello', 'not-an-object', '496', ENGLISH)).toBe('Hello')
    expect(resolveText('Hello', ['Bonjour'], '496', ENGLISH)).toBe('Hello')
    expect(
      resolveText('Hello', { '496': { source: 'human' } }, '496', ENGLISH)
    ).toBe('Hello')
  })

  it('reads the column when no language is requested', () => {
    expect(resolveText('Hello', translations, null, ENGLISH)).toBe('Hello')
  })
})
