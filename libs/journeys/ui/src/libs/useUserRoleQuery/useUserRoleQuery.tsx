import { QueryResult, useQuery } from '@apollo/client'
import { ResultOf, graphql } from '@core/shared/gql'

export type GetUserRole = ResultOf<typeof GET_USER_ROLE>

export const GET_USER_ROLE = graphql(`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`)

export function useUserRoleQuery(): QueryResult<GetUserRole> {
  const query = useQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
