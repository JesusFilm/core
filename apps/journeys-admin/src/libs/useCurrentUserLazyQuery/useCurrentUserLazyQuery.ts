import {
  LazyQueryExecFunction,
  OperationVariables,
  gql,
  useLazyQuery
} from '@apollo/client'

import {
  GetCurrentUser_me_AnonymousUser as ApiAnonymousUser,
  GetCurrentUser_me_AuthenticatedUser as ApiUser,
  GetCurrentUser
} from '../../../__generated__/GetCurrentUser'

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ... on AuthenticatedUser {
        id
        email
      }
    }
  }
`

export function useCurrentUserLazyQuery(): {
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
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
