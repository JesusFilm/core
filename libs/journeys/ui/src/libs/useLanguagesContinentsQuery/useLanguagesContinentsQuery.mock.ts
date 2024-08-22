import { MockedResponse } from '@apollo/client/testing'

import { GetLanguagesContinents } from './__generated__/GetLanguagesContinents'
import { languagesContinents } from './data'
import { GET_LANGUAGES_CONTINENTS } from './useLanguagesContinentsQuery'

export const getLanguagesContinentsMock: MockedResponse<GetLanguagesContinents> =
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
