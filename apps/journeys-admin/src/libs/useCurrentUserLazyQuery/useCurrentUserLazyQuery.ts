import {
  LazyQueryExecFunction,
  OperationVariables,
  gql,
  useLazyQuery
} from '@apollo/client'

import {
  GetCurrentUser_me as ApiUser,
  GetCurrentUser
} from '../../../__generated__/GetCurrentUser'

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ... on AuthenticatedUser {
        id
        email
      }
      ... on AnonymousUser {
        id
      }
    }
  }
`

export function useCurrentUserLazyQuery(): {
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
  data?: ApiUser | null
} {
  const [loadUser, { data }] = useLazyQuery<GetCurrentUser>(GET_CURRENT_USER)

  return {
    loadUser,
    data: data?.me
  }
}
