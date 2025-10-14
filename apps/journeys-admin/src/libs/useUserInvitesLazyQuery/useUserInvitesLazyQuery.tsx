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

export function useUserInvitesLazyQuery(
  variables?: GetUserInvitesVariables
): useLazyQuery.ResultTuple<GetUserInvites, GetUserInvitesVariables> {
  const query = useLazyQuery<GetUserInvites, GetUserInvitesVariables>(
    GET_USER_INVITES,
    {
      variables
    }
  )

  return query
}
