import { OperationVariables, gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

import {
  GetCurrentUser_me_AnonymousUser as ApiAnonymousUser,
  GetCurrentUser_me_AuthenticatedUser as ApiUser,
  GetCurrentUser
} from '../../../__generated__/GetCurrentUser'

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      ... on AuthenticatedUser {
        email
      }
    }
  }
`

export function useCurrentUserLazyQuery(): {
  loadUser: useLazyQuery.ExecFunction<GetCurrentUser, OperationVariables>
  data: ApiUser | ApiAnonymousUser
} {
  const [loadUser, { data }] = useLazyQuery<GetCurrentUser>(GET_CURRENT_USER)

  if (data?.me != null) {
    return { loadUser, data: data.me }
  }

  return {
    loadUser,
    data: { __typename: 'AuthenticatedUser', id: '', email: '' }
  }
}
