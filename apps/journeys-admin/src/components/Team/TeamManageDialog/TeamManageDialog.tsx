import { ReactElement, useEffect, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'

import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { useTeam } from '../TeamProvider'
import { useCurrentUser } from '../../../libs/useCurrentUser'
import { AddUserSection } from '../../AccessDialog/AddUserSection'
import { TeamMemberList } from './TeamMemberList'

export const GET_USER_TEAMS = gql`
  query UserTeams($teamId: ID!) {
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
  const { data, refetch } = useQuery(GET_USER_TEAMS, {
    variables: { teamId: activeTeam?.id }
  })

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUser = useMemo(() => {
    return data?.userTeams?.find(
      (userTeam) => userTeam.user.email === authUser.email
    )
  }, [authUser, data?.userTeams])

  const mutableUsers = data?.userTeams?.map((user) => user)

  const emails = useMemo(() => {
    return data?.userTeams?.map((userTeam) => userTeam.user.email)
  }, [data?.userTeams])

  useEffect(() => {
    if (open) {
      void loadUser()
      void refetch()
    }
  }, [open, loadUser, refetch, activeTeam?.id])

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      divider
      dialogTitle={{
        title: 'Invite others to your team',
        closeButton: true
      }}
      dialogActionChildren={<AddUserSection users={emails} />} // create new component for AddUserSection //emails variable is used to validate
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        <TeamMemberList
          title="Members"
          users={mutableUsers}
          currentUser={currentUser}
        />
        {/* <UserList // create new UserList component
          title="Members"
          loading={loading}
          users={data?.userTeams ?? []}
          currentUser={currentUser}
        /> */}
      </Stack>
    </Dialog>
  )
}
