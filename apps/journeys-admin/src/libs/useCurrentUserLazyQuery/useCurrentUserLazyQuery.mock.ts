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
        userId: 'firebase-uid-123',
        email: 'test@email.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      }
    }
  }
}
