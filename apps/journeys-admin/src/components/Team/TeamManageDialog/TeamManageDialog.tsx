import { ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { AddUserSection } from '../../AccessDialog/AddUserSection'
import { UserTeamList } from './UserTeamList'
import { UserTeamInvitesList } from './UserTeamInvitesList'

interface TeamManageDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamManageDialog({
  open,
  onClose
}: TeamManageDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      divider
      dialogTitle={{
        title: 'Invite others to your team',
        closeButton: true
      }}
      dialogActionChildren={<AddUserSection addTeamMembers />}
      fullscreen={!smUp}
    >
      <Stack spacing={4}>
        <Typography variant="subtitle1">Members</Typography>
        <UserTeamList />
        <UserTeamInvitesList />
      </Stack>
    </Dialog>
  )
}
