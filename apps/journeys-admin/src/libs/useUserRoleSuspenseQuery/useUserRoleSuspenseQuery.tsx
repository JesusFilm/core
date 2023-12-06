import { UseSuspenseQueryResult, gql, useSuspenseQuery } from '@apollo/client'

import { GetUserRole } from '../../../__generated__/GetUserRole'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function useUserRoleSuspenseQuery(): UseSuspenseQueryResult<GetUserRole> {
  const query = useSuspenseQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
