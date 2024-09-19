import { MockedResponse } from '@apollo/client/testing'

import { GetCurrentUser } from '../../../__generated__/GetCurrentUser'

import { GET_CURRENT_USER } from './useCurrentUserLazyQuery'

export const mockUseCurrentUserLazyQuery: MockedResponse<GetCurrentUser> = {
  request: {
    query: GET_CURRENT_USER
  },
  result: {
    data: {
      me: {
        __typename: 'User',
        id: 'user.id',
        email: 'test@email.com'
      }
    }
  }
}
