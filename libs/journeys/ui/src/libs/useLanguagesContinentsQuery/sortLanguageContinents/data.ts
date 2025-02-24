import { GetLanguagesContinentsQuery } from '../__generated__/useLanguagesContinentsQuery'

import { LanguageContinentsRecord } from './sortLanguageContinents'

type Languages = GetLanguagesContinentsQuery['languages'][number]
type CountryLanguage =
  GetLanguagesContinentsQuery['languages'][number]['countryLanguages'][number]

export const sortedLanguageContinents: LanguageContinentsRecord = {
  Africa: ['Deutsch', 'Arabic'],
  Asia: [
    'Mandarin',
    'Japanese',
    'Cantonese',
    'Chinese, Simplified',
    'Chinese, Traditional'
  ],
  Europe: ['Français', 'Spanish, Castilian'],
  Oceania: ['Bislama'],
  'North America': ['English'],
  'South America': ['Português', 'Spanish, Latin American']
}

export const northAmericaCountryLanguage: CountryLanguage = {
  __typename: 'CountryLanguage',
  country: {
    __typename: 'Country',
    continent: {
      __typename: 'Continent',
      id: 'North America'
    }
  }
}

export const asiaCountryLanguage: CountryLanguage = {
  __typename: 'CountryLanguage',
  country: {
    __typename: 'Country',
    continent: {
      __typename: 'Continent',
      id: 'Asia'
    }
  }
}

export const languageWithMultipleCountries: Languages[] = [
  {
    id: '1',
    __typename: 'Language',
    name: [{ __typename: 'LanguageName', value: 'English' }],
    countryLanguages: [northAmericaCountryLanguage, northAmericaCountryLanguage]
  },
  {
    id: '2',
    __typename: 'Language',
    name: [{ __typename: 'LanguageName', value: 'Mandarin' }],
    countryLanguages: [asiaCountryLanguage, asiaCountryLanguage]
  }
]

export const languageWithNoCountries: Languages[] = [
  {
    id: '1',
    __typename: 'Language',
    name: [{ __typename: 'LanguageName', value: 'English' }],
    countryLanguages: []
  }
]
