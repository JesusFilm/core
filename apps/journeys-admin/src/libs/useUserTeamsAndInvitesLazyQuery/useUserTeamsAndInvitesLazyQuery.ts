import { LazyQueryResultTuple, useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvitesVariables
} from '../../../__generated__/GetUserTeamsAndInvites'
import { GET_USER_TEAMS_AND_INVITES } from '../useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

export function useUserTeamsAndInvitesLazyQuery(): {
  query: LazyQueryResultTuple<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables
  >
  emails: string[]
} {
  const [emails, setEmails] = useState<string[]>([])
  const query = useLazyQuery<
    GetUserTeamsAndInvites,
    GetUserTeamsAndInvitesVariables
  >(GET_USER_TEAMS_AND_INVITES, {
    onCompleted: ({ userTeams, userTeamInvites }) => {
      setEmails([
        ...userTeams.map(({ user: { email } }) => email.toLowerCase()),
        ...userTeamInvites.map(({ email }) => email.toLowerCase())
      ])
    }
  })

  return {
    query,
    emails
  }
}
