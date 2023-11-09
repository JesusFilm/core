import { convertLanguagesToOptions } from './convertLanguagesToOptions'

describe('convertLanguagesToOptions', () => {
  const languageIds = ['529', '496']
  const languages = [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'Translation'
        }
      ]
    },
    {
      id: '496',
      __typename: 'Language',
      name: [
        {
          value: 'Français',
          primary: true,
          __typename: 'Translation'
        },
        {
          value: 'French',
          primary: false,
          __typename: 'Translation'
        }
      ]
    },
    {
      id: '1106',
      __typename: 'Language',
      name: [
        {
          value: 'Deutsch',
          primary: true,
          __typename: 'Translation'
        },
        {
          value: 'German, Standard',
          primary: false,
          __typename: 'Translation'
        }
      ]
    }
  ]

  it('should return an array of formatted languages', () => {
    expect(convertLanguagesToOptions(languageIds, languages)).toEqual([
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' }
    ])
  })
})
