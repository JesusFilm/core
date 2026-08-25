import { gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

import {
  GetUserInvites,
  GetUserInvitesVariables
} from '../../../__generated__/GetUserInvites'

export const GET_USER_INVITES = gql`
  query GetUserInvites($journeyId: ID!) {
    userInvites(journeyId: $journeyId) {
      id
      journeyId
      email
      acceptedAt
      removedAt
    }
  }
`

/**
 * Apollo Client 4 moved `variables` from the hook to the execute function, so
 * callers pass them when they run the query rather than when they mount.
 */
export function useUserInvitesLazyQuery(): useLazyQuery.ResultTuple<
  GetUserInvites,
  GetUserInvitesVariables
> {
  return useLazyQuery<GetUserInvites, GetUserInvitesVariables>(GET_USER_INVITES)
}
