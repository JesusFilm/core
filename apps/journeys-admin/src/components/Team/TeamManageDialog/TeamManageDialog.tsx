import { ReactElement, useEffect, useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Dialog } from '@core/shared/ui/Dialog'
import { useTeam } from '../TeamProvider'

import { UserList } from '../../AccessDialog/UserList'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { useCurrentUser } from '../../../libs/useCurrentUser'
import { AddUserSection } from '../../AccessDialog/AddUserSection'

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
  const { loading, data, refetch } = useQuery(GET_USER_TEAMS, {
    variables: { teamId: activeTeam?.id }
  })

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const currentUser = useMemo(() => {
    return data?.userTeams?.find((user) => user.user.email === authUser.email)
  }, [authUser, data?.userTeams])

  const emails = useMemo(() => {
    return data?.userTeams?.map((user) => user.user.email)
  }, [data?.userTeams])

  useEffect(() => {
    if (open === true) {
      void loadUser()
      void refetch({ teamId: activeTeam?.id })
    }
  }, [open, loadUser, refetch])

  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      divider
      dialogTitle={{
        title: 'Invite others to your team',
        closeButton: true
      }}
      dialogActionChildren={<AddUserSection users={emails} />} //create new component for AddUserSection
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        <UserList //create new UserList component
          title="Members"
          loading={loading}
          users={data?.userTeams}
          currentUser={currentUser}
        />
      </Stack>
    </Dialog>
  )
}
