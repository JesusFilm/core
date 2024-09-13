import { GetCountry_country as Country } from './__generated__/GetCountry'

export const country: Country = {
  __typename: 'Country',
  id: 'US',
  flagPngSrc:
    'https://d3s4plubcuq0w9.cloudfront.net/flags/png_8/flag_country_detail_us.png',
  continent: {
    __typename: 'Continent',
    name: [
      {
        __typename: 'ContinentName',
        value: 'North America'
      }
    ]
  },
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
            value: 'Spanish Latin American'
          },
          {
            __typename: 'LanguageName',
            primary: false,
            value: 'Spanish Latin American'
          }
        ]
      },
      speakers: 200
    }
  ]
}
