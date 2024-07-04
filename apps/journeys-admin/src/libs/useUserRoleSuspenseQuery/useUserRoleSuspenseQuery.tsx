import { UseSuspenseQueryResult, useSuspenseQuery } from '@apollo/client'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import { GetUserRole } from '../../../__generated__/GetUserRole'

export function useUserRoleSuspenseQuery(): UseSuspenseQueryResult<GetUserRole> {
  const query = useSuspenseQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
