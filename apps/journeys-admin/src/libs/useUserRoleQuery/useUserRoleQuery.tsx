import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetUserRole } from '../../../__generated__/GetUserRole'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function useUserRoleQuery(): QueryResult<GetUserRole> {
  const query = useQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
