import { ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'

import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'

import { AddUserSection } from '../../AccessDialog/AddUserSection'
import { TeamMemberList } from './TeamMemberList'

interface TeamManageDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamManageDialog({
  open,
  onClose
}: TeamManageDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const emails = []
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
        <TeamMemberList title="Members" />
      </Stack>
    </Dialog>
  )
}
