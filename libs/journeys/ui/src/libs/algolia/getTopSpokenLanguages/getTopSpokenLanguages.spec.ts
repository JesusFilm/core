import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import { GetCountry_country as Country } from '../../useCountryQuery/__generated__/GetCountry'
import { country } from '../../useCountryQuery/data'

import { getTopSpokenLanguages, removeCommas } from './getTopSpokenLanguages'

describe('removeCommas', () => {
  it('should remove commas from a string', () => {
    const value = 'Spanish, Latin American'
    const result = removeCommas(value)
    expect(result).toBe('Spanish Latin American')
  })
})

describe('getTopSpokenLanguages', () => {
  const availableLanguages = [
    { value: 'English' },
    { value: 'Spanish, Latin American' },
    { value: 'French' },
    { value: 'German' },
    { value: 'Italian' }
  ] as unknown as RefinementListItem[]

  const countryWithMoreLanguages: Country = {
    ...country,
    countryLanguages: [
      ...country.countryLanguages,
      {
        __typename: 'CountryLanguage',
        language: {
          __typename: 'Language',
          name: [
            {
              __typename: 'LanguageName',
              primary: false,
              value: 'French'
            }
          ]
        },
        speakers: 400
      },
      {
        __typename: 'CountryLanguage',
        language: {
          __typename: 'Language',
          name: [
            {
              __typename: 'LanguageName',
              primary: false,
              value: 'German'
            }
          ]
        },
        speakers: 50
      },
      {
        __typename: 'CountryLanguage',
        language: {
          __typename: 'Language',
          name: [
            {
              __typename: 'LanguageName',
              primary: false,
              value: 'Italian'
            }
          ]
        },
        speakers: 50
      }
    ]
  }

  it('should return the top spoken languages of a country', () => {
    const topSpokenLanguages = getTopSpokenLanguages({
      country,
      availableLanguages
    })

    expect(topSpokenLanguages).toEqual(['Spanish, Latin American', 'English'])
  })

  it('should return the top spoken languages of a country when there are more than 4 languages', () => {
    const topSpokenLanguages = getTopSpokenLanguages({
      country: countryWithMoreLanguages,
      availableLanguages
    })

    expect(topSpokenLanguages).toEqual([
      'French',
      'Spanish, Latin American',
      'English',
      'German'
    ])
  })

  it('should not return languages that are not available in Algolia refinement', () => {
    const customAvailableLanguages = availableLanguages.filter(
      (language) => language.value !== 'Spanish, Latin American'
    )

    const topSpokenLanguages = getTopSpokenLanguages({
      country: countryWithMoreLanguages,
      availableLanguages: customAvailableLanguages
    })

    expect(topSpokenLanguages).toEqual([
      'French',
      'English',
      'German',
      'Italian'
    ])
  })

  it('should limit the number of languages returned', () => {
    const topSpokenLanguages = getTopSpokenLanguages({
      country: countryWithMoreLanguages,
      availableLanguages,
      limit: 2
    })

    expect(topSpokenLanguages).toHaveLength(2)
  })

  it('should return an empty array if the country is null', () => {
    const topSpokenLanguages = getTopSpokenLanguages({
      country: null,
      availableLanguages
    })

    expect(topSpokenLanguages).toEqual([])
  })
})
