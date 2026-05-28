import { extractLanguageNames } from './extractLanguageNames'

describe('extractLanguageNames', () => {
  it('returns undefined for empty name array', () => {
    expect(extractLanguageNames([])).toEqual({
      localName: undefined,
      nativeName: undefined
    })
  })

  it('extracts local and native names from standard mixed-primary array', () => {
    expect(
      extractLanguageNames([
        { value: 'Français', primary: true },
        { value: 'French', primary: false }
      ])
    ).toEqual({ localName: 'French', nativeName: 'Français' })
  })

  it('returns only nativeName for a single primary-true entry', () => {
    expect(extractLanguageNames([{ value: 'English', primary: true }])).toEqual(
      { localName: undefined, nativeName: 'English' }
    )
  })

  it('handles all-primary entries by treating index 0 as native and index 1 as local', () => {
    expect(
      extractLanguageNames([
        { value: 'Français', primary: true },
        { value: 'French', primary: true }
      ])
    ).toEqual({ localName: 'French', nativeName: 'Français' })
  })

  it('handles all-primary entries with more than 2 names', () => {
    expect(
      extractLanguageNames([
        { value: 'Deutsch', primary: true },
        { value: 'German, Standard', primary: true },
        { value: 'Allemand', primary: true }
      ])
    ).toEqual({ localName: 'German, Standard', nativeName: 'Deutsch' })
  })

  it('fills in localName from remaining entries when only a native is found', () => {
    // primary: true yields nativeName; a second primary: true entry should
    // become localName because there is no primary: false entry
    expect(
      extractLanguageNames([
        { value: 'English', primary: true },
        { value: 'Anglais', primary: true }
      ])
    ).toEqual({ localName: 'Anglais', nativeName: 'English' })
  })

  it('returns localName (no nativeName) for a single non-primary entry', () => {
    expect(extractLanguageNames([{ value: 'French', primary: false }])).toEqual(
      { localName: 'French', nativeName: undefined }
    )
  })
})
