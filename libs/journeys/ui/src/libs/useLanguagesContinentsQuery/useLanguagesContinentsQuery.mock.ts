import { MockedResponse } from '@apollo/client/testing'

import { GetLanguagesContinentsQuery } from './__generated__/useLanguagesContinentsQuery'
import { languagesContinents } from './data'
import { GET_LANGUAGES_CONTINENTS } from './useLanguagesContinentsQuery'

export const getLanguagesContinentsMock: MockedResponse<GetLanguagesContinentsQuery> =
  {
    request: {
      query: GET_LANGUAGES_CONTINENTS
    },
    result: {
      data: {
        languages: languagesContinents
      }
    }
  }
