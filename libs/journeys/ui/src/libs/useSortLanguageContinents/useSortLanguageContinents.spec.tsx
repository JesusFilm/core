import {
  GetLanguagesContinents_languages_countryLanguages as CountryLanguage,
  GetLanguagesContinents_languages as Languages
} from '../useLanguagesContinentsQuery/__generated__/GetLanguagesContinents'
import { languagesContinents } from '../useLanguagesContinentsQuery/data'

import { sortedLanguageContinents } from './data'
import { useSortLanguageContinents } from './useSortLanguageContinents'

describe('useSortLanguageContinents', () => {
  it('should return a record of continents and languages', () => {
    const result = useSortLanguageContinents({ languages: languagesContinents })
    expect(result).toEqual(sortedLanguageContinents)
  })

  it('should handle duplicate languages', () => {
    const northAmericaCountryLanguage: CountryLanguage = {
      __typename: 'CountryLanguage',
      country: {
        __typename: 'Country',
        continent: {
          __typename: 'Continent',
          id: 'North America'
        }
      }
    }

    const asiaCountryLanguage: CountryLanguage = {
      __typename: 'CountryLanguage',
      country: {
        __typename: 'Country',
        continent: {
          __typename: 'Continent',
          id: 'Asia'
        }
      }
    }

    const languageWithMultipleCountries: Languages[] = [
      {
        id: '1',
        __typename: 'Language',
        name: [{ __typename: 'LanguageName', value: 'English' }],
        countryLanguages: [
          northAmericaCountryLanguage,
          northAmericaCountryLanguage
        ]
      },
      {
        id: '2',
        __typename: 'Language',
        name: [{ __typename: 'LanguageName', value: 'Mandarin' }],
        countryLanguages: [asiaCountryLanguage, asiaCountryLanguage]
      }
    ]

    const result = useSortLanguageContinents({
      languages: languageWithMultipleCountries
    })
    expect(result).toEqual({
      'North America': ['English'],
      Asia: ['Mandarin']
    })
  })

  it('should return an empty record if no languages are provided', () => {
    const result = useSortLanguageContinents({ languages: [] })
    expect(result).toEqual({})
  })

  it('should handle languages with no associated countries or continents', () => {
    const languageWithNoCountries: Languages[] = [
      {
        id: '1',
        __typename: 'Language',
        name: [{ __typename: 'LanguageName', value: 'English' }],
        countryLanguages: []
      }
    ]

    const result = useSortLanguageContinents({
      languages: languageWithNoCountries
    })
    expect(result).toEqual({})
  })
})
