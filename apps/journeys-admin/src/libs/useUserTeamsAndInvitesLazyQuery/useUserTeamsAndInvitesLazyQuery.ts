import { useLazyQuery } from "@apollo/client/react";
import { useState } from 'react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvitesVariables
} from '../../../__generated__/GetUserTeamsAndInvites'
import { GET_USER_TEAMS_AND_INVITES } from '../useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

export function useUserTeamsAndInvitesLazyQuery(): {
  query: useLazyQuery.ResultTuple<
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
