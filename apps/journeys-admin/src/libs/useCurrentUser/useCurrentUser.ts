import {
  LazyQueryExecFunction,
  OperationVariables,
  gql,
  useLazyQuery
} from '@apollo/client'

import {
  GetCurrentUser,
  GetCurrentUser_me as User
} from '../../../__generated__/GetCurrentUser'

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
    }
  }
`

export function useCurrentUser(): {
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
  data: User
} {
  const [loadUser, { data }] = useLazyQuery<GetCurrentUser>(GET_CURRENT_USER)

  if (data?.me != null) {
    return { loadUser, data: data.me }
  }

  return { loadUser, data: { __typename: 'User', id: '', email: '' } }
}
