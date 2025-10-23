import { MockLink } from '@apollo/client/testing'

import { GetCountry } from './__generated__/GetCountry'
import { country } from './data'
import { GET_COUNTRY } from './useCountryQuery'

export const getCountryMock: MockLink.MockedResponse<GetCountry> = {
  request: {
    query: GET_COUNTRY,
    variables: {
      countryId: 'US'
    }
  },
  result: {
    data: {
      country
    }
  }
}
