import { UseSuspenseQueryResult, useSuspenseQuery } from '@apollo/client'

import { GetUserRole } from '../../../__generated__/GetUserRole'
import { GET_USER_ROLE } from '../useUserRoleQuery/useUserRoleQuery'

export function useUserRoleSuspenseQuery(): UseSuspenseQueryResult<GetUserRole> {
  const query = useSuspenseQuery<GetUserRole>(GET_USER_ROLE)

  return query
}
