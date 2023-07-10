import { ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { AddUserSection } from '../../AccessDialog/AddUserSection'
import { TeamMembersList } from './TeamMembersList/TeamMembersList'

interface TeamManageDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamManageDialog({
  open,
  onClose
}: TeamManageDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')
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
        <Typography variant="subtitle1">{t('Members')}</Typography>
        <TeamMembersList />
      </Stack>
    </Dialog>
  )
}
