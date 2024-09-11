import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import { GetCountry_country as Country } from '../../useCountryQuery/__generated__/GetCountry'
import { country } from '../../useCountryQuery/data'

import { getTopSpokenLanguages } from './getTopSpokenLanguages'

describe('getTopSpokenLanguages', () => {
  const availableLanguages = [
    { value: 'English' },
    { value: 'Spanish' },
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

    expect(topSpokenLanguages).toEqual(['Spanish', 'English'])
  })

  it('should return the top spoken languages of a country when there are more than 4 languages', () => {
    const topSpokenLanguages = getTopSpokenLanguages({
      country: countryWithMoreLanguages,
      availableLanguages
    })

    expect(topSpokenLanguages).toEqual([
      'French',
      'Spanish',
      'English',
      'German'
    ])
  })

  it('should not return languages that are not available in Algolia refinement', () => {
    const customAvailableLanguages = availableLanguages.filter(
      (language) => language.value !== 'Spanish'
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
})
