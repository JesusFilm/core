import { GetCountry_country as Country } from './__generated__/GetCountry'

export const country: Country = {
  __typename: 'Country',
  id: 'US',
  flagPngSrc: 'https://example.flag.com',
  countryLanguages: [
    {
      __typename: 'CountryLanguage',
      language: {
        __typename: 'Language',
        name: [
          {
            __typename: 'LanguageName',
            primary: false,
            value: 'English'
          }
        ]
      },
      speakers: 100
    },
    {
      __typename: 'CountryLanguage',
      language: {
        __typename: 'Language',
        name: [
          {
            __typename: 'LanguageName',
            primary: true,
            value: 'Spanish'
          },
          {
            __typename: 'LanguageName',
            primary: true,
            value: 'Spanish'
          }
        ]
      },
      speakers: 200
    }
  ]
}
