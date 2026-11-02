import { sortLanguageOptions } from './sortLanguageOptions'

describe('sortLanguageOptions', () => {
  it('sorts alphabetically by local name', () => {
    const options = [
      { id: '3', localName: 'Mongolian', nativeName: 'ᠮᠣᠨᠭᠭᠣᠯ' },
      { id: '1', localName: 'Burmese', nativeName: 'မြန်မာစာ' },
      { id: '2', localName: 'German', nativeName: 'Deutsch' }
    ]

    expect(sortLanguageOptions(options).map(({ id }) => id)).toEqual([
      '1',
      '2',
      '3'
    ])
  })

  it('falls back to the native name when there is no local name', () => {
    const options = [
      { id: '2', nativeName: 'Zulu' },
      { id: '1', localName: 'Arabic', nativeName: 'العربية' },
      { id: '3', nativeName: 'English' }
    ]

    expect(sortLanguageOptions(options).map(({ id }) => id)).toEqual([
      '1',
      '3',
      '2'
    ])
  })

  it('does not mutate the input array', () => {
    const options = [
      { id: '2', localName: 'B' },
      { id: '1', localName: 'A' }
    ]

    sortLanguageOptions(options)

    expect(options.map(({ id }) => id)).toEqual(['2', '1'])
  })
})
