import { MockedResponse } from '@apollo/client/testing'

import { GetCountry } from './__generated__/GetCountry'
import { country } from './data'
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
      country
    }
  }
}
