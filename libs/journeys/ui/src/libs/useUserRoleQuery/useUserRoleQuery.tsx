import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetUserRoleQuery } from './__generated__/useUserRoleQuery'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function useUserRoleQuery(): QueryResult<GetUserRoleQuery> {
  const query = useQuery<GetUserRoleQuery>(GET_USER_ROLE)

  return query
}
