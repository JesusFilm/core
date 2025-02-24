import { MockedResponse } from '@apollo/client/testing'

import { GetCountryQuery } from './__generated__/useCountryQuery'
import { country } from './data'
import { GET_COUNTRY } from './useCountryQuery'

export const getCountryMock: MockedResponse<GetCountryQuery> = {
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
