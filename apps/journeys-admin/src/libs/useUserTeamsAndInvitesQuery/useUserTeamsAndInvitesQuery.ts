import { QueryResult, gql, useQuery } from '@apollo/client'
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
        email
        firstName
        id
        imageUrl
        lastName
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
): QueryResult<GetUserTeamsAndInvites, GetUserTeamsAndInvitesVariables> & {
  emails: string[]
} {
  const query = useQuery<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables
  >(GET_USER_TEAMS_AND_INVITES, {
    variables
  })

  const emails = useMemo(() => {
    return [
      ...(query.data?.userTeams.map(({ user: { email } }) =>
        email.toLowerCase()
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
