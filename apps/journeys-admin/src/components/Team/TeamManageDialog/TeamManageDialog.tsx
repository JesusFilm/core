import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { TeamManageWrapper } from './TeamManageWrapper'

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
    <TeamManageWrapper>
      {({ userTeamList, userTeamInviteList, userTeamInviteForm }) => (
        <Dialog
          open={open ?? false}
          onClose={onClose}
          divider
          dialogTitle={{
            title: t('Manage Members'),
            closeButton: true
          }}
          dialogActionChildren={
            <Stack flexGrow={1} sx={{ m: 4, mt: 2 }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
                <UsersProfiles2Icon />
                <Typography variant="subtitle1" sx={{ ml: 3 }}>
                  {t('Invite team member')}
                </Typography>
              </Stack>
              {userTeamInviteForm}
            </Stack>
          }
          fullscreen={!smUp}
          testId="TeamManageDialog"
        >
          <Stack spacing={4}>
            {userTeamList}
            {userTeamInviteList}
          </Stack>
        </Dialog>
      )}
    </TeamManageWrapper>
  )
}
