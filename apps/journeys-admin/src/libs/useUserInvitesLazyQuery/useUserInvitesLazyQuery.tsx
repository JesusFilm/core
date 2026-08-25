import { gql } from '@apollo/client'
import { skipToken, useLazyQuery, useQuery } from '@apollo/client/react'

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

/**
 * Reads a journey's invites, holding off until `journeyId` is supplied — used
 * where the invites are rendered rather than fetched from a handler. The
 * network-only policy refetches whenever the caller un-skips, matching how the
 * access dialog refreshed its list on every open.
 */
export function useUserInvitesQuery(
  journeyId?: string
): useQuery.Result<
  GetUserInvites,
  GetUserInvitesVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetUserInvitesVariables>
> {
  return useQuery<GetUserInvites, GetUserInvitesVariables>(
    GET_USER_INVITES,
    journeyId == null
      ? skipToken
      : { variables: { journeyId }, fetchPolicy: 'network-only' }
  )
}
