import { MockedResponse } from '@apollo/client/testing'

import { GetCountry } from './__generated__/GetCountry'
import { GET_COUNTRY } from './useCountryQuery'

export const getCountryMock: MockedResponse<GetCountry> = {
  request: {
    query: GET_COUNTRY,
    variables: {
      countryId: 'country.id'
    }
  },
  result: {
    data: {
      country: {
        __typename: 'Country',
        id: 'country.id',
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
    }
  }
}
