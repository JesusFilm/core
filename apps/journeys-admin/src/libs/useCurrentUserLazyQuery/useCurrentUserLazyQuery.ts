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

/**
 * The signed-in user, loaded on demand. Until `me` answers, `data` is a
 * fallback user with an empty id; `loading` and `error` tell an unanswered
 * query from a failed one.
 */
export function useCurrentUserLazyQuery(): {
  loadUser: useLazyQuery.ExecFunction<GetCurrentUser, OperationVariables>
  data: ApiUser | ApiAnonymousUser
  loading: boolean
  error?: Error
} {
  const [loadUser, { data, loading, error }] =
    useLazyQuery<GetCurrentUser>(GET_CURRENT_USER)

  if (data?.me != null) {
    return { loadUser, data: data.me, loading, error }
  }

  return {
    loadUser,
    data: { __typename: 'AuthenticatedUser', id: '', email: '' },
    loading,
    error
  }
}
