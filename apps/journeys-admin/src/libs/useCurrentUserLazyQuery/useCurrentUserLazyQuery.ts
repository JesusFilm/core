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
      id
      firstName
      lastName
      email
    }
  }
`

export function useCurrentUserLazyQuery(): {
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
  data: ApiUser
} {
  const [loadUser, { data }] = useLazyQuery<GetCurrentUser>(GET_CURRENT_USER)

  if (data?.me != null) {
    return { loadUser, data: data.me }
  }

  return {
    loadUser,
    data: { __typename: 'User', id: '', firstName: '', lastName: '', email: '' }
  }
}
