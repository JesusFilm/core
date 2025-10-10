import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { GetUserRole } from './__generated__/GetUserRole'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function useUserRoleQuery(): useQuery.Result<GetUserRole> {
  const query = useQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
