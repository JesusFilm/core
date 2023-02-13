import { gql, useQuery } from '@apollo/client'
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

export function useCurrentUser(): User {
  const { data, loading } = useQuery<GetCurrentUser>(GET_CURRENT_USER)

  if (!loading) {
    if (data?.me == null) {
      throw new Error('Current user cannot be found')
    }
    return data.me
  }

  return { __typename: 'User', id: '', email: '' }
}
