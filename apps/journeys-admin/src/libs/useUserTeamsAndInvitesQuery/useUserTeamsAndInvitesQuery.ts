import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvitesVariables
} from '../../../__generated__/GetUserTeamsAndInvites'

export const GET_USER_TEAMS_AND_INVITES = gql`
  query GetUserTeamsAndInvites($teamId: ID!, $where: UserTeamFilterInput!) {
    userTeams(teamId: $teamId, where: $where) {
      id
      role
      user {
        id
        ... on AuthenticatedUser {
          email
          firstName
          imageUrl
          lastName
        }
      }
    }
    userTeamInvites(teamId: $teamId) {
      email
      id
      teamId
    }
  }
`

export function useUserTeamsAndInvitesQuery(
  variables?: GetUserTeamsAndInvitesVariables
): useQuery.Result<
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvitesVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetUserTeamsAndInvitesVariables>
> & {
  emails: string[]
} {
  const query = useQuery<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables
  >(
    GET_USER_TEAMS_AND_INVITES,
    // Apollo Client 4 requires `variables` for operations that declare
    // required ones. Callers hand us `undefined` while the team is unknown,
    // which is what `skipToken` expresses.
    variables == null ? skipToken : { variables }
  )

  const emails = useMemo(() => {
    return [
      ...(query.data?.userTeams
        .filter(({ user }) => user.__typename === 'AuthenticatedUser')
        .map(({ user }) =>
          user.__typename === 'AuthenticatedUser'
            ? user.email.toLowerCase()
            : ''
        ) ?? []),
      ...(query.data?.userTeamInvites.map(({ email }) => email.toLowerCase()) ??
        [])
    ]
  }, [query])

  return {
    ...query,
    emails
  }
}
