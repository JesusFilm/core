import { ReactElement, useEffect, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'

import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { useTeam } from '../TeamProvider'
import { useCurrentUser } from '../../../libs/useCurrentUser'
import { AddUserSection } from '../../AccessDialog/AddUserSection'
import {
  GetUserTeams,
  GetUserTeams_userTeams as UserTeam
} from '../../../../__generated__/GetUserTeams'
import { TeamMemberList } from './TeamMemberList'

export const GET_USER_TEAMS = gql`
  query GetUserTeams($teamId: ID!) {
    userTeams(teamId: $teamId) {
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
  }
`
export const GET_USER_TEAM_INVITES = gql`
  query GetUserTeamInvites($teamId: ID!) {
    userTeamInvites(teamId: $teamId) {
      email
      id
      teamId
    }
  }
`

interface TeamManageDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamManageDialog({
  open,
  onClose
}: TeamManageDialogProps): ReactElement {
  const { activeTeam } = useTeam()
  const { loadUser, data: authUser } = useCurrentUser()
  const { data, refetch } = useQuery<GetUserTeams>(GET_USER_TEAMS, {
    variables: { teamId: activeTeam?.id }
  })
  const { data: userTeamInvitesData, refetch: refetchUserTeamInvitesData } =
    useQuery(GET_USER_TEAM_INVITES, {
      variables: { teamId: activeTeam?.id }
    })

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const { currentUser, users, emails, invites } = useMemo(() => {
    const users: UserTeam[] = []
    const emails: string[] = []
    let currentUser

    data?.userTeams.forEach((userTeam) => {
      if (userTeam.user.email === authUser.email) currentUser = userTeam
      users.push(userTeam)
      emails.push(userTeam.user.email)
    })

    const invites = userTeamInvitesData?.userTeamInvites.map((invite) => {
      emails.push(invite.email)
      return invite
    })

    return { currentUser, users, emails, invites }
  }, [authUser, data, userTeamInvitesData])

  useEffect(() => {
    if (open) {
      void loadUser()
      void refetch()
      void refetchUserTeamInvitesData()
    }
  }, [open, loadUser, refetch, activeTeam?.id, refetchUserTeamInvitesData])

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      divider
      dialogTitle={{
        title: 'Invite others to your team',
        closeButton: true
      }}
      dialogActionChildren={<AddUserSection users={emails} addTeamMembers />} // create new component for AddUserSection //emails variable is used to validate
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        <TeamMemberList
          title="Members"
          users={users}
          invites={invites}
          currentUser={currentUser}
        />
      </Stack>
    </Dialog>
  )
}
