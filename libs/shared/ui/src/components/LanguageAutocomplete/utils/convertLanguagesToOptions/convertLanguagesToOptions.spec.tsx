import { convertLanguagesToOptions } from './convertLanguagesToOptions'

describe('convertLanguagesToOptions', () => {
  const languages = [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'LanguageName'
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
          __typename: 'LanguageName'
        },
        {
          value: 'French',
          primary: false,
          __typename: 'LanguageName'
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
          __typename: 'LanguageName'
        },
        {
          value: 'German, Standard',
          primary: false,
          __typename: 'LanguageName'
        }
      ]
    }
  ]

  it('should return an array of formatted languages', () => {
    expect(convertLanguagesToOptions(languages)).toEqual([
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' },
      { id: '1106', localName: 'German, Standard', nativeName: 'Deutsch' }
    ])
  })
})
