import { useLazyQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvitesVariables
} from '../../../__generated__/GetUserTeamsAndInvites'
import { GET_USER_TEAMS_AND_INVITES } from '../useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

export function useUserTeamsAndInvitesLazyQuery(): {
  query: useLazyQuery.ResultTuple<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables,
    'empty' | 'complete' | 'streaming'
  >
  emails: string[]
} {
  const [emails, setEmails] = useState<string[]>([])
  const query = useLazyQuery<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables
  >(GET_USER_TEAMS_AND_INVITES)
  const [, { data }] = query

  // Apollo Client 4 removed `useLazyQuery`'s `onCompleted` option.
  useEffect(() => {
    if (data == null) return
    setEmails([
      ...data.userTeams
        .filter(({ user }) => user.__typename === 'AuthenticatedUser')
        .map(({ user }) =>
          user.__typename === 'AuthenticatedUser'
            ? user.email.toLowerCase()
            : ''
        ),
      ...data.userTeamInvites.map(({ email }) => email.toLowerCase())
    ])
  }, [data])

  return {
    query,
    emails
  }
}
