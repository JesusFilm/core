import { useSuspenseQuery } from '@apollo/client/react'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import { GetUserRole } from '../../../__generated__/GetUserRole'

export function useUserRoleSuspenseQuery(): useSuspenseQuery.Result<GetUserRole> {
  const query = useSuspenseQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
