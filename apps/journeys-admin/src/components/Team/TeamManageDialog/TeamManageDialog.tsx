import { ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import UserProfileAdd from '@core/shared/ui/icons/UserProfileAdd'
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
            title: 'Manage Members',
            closeButton: true
          }}
          dialogActionChildren={
            <Stack flexGrow={1} sx={{ m: 4, mt: 2 }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
                <UserProfileAdd />
                <Typography variant="subtitle1" sx={{ ml: 3 }}>
                  {t('Invite team member')}
                </Typography>
              </Stack>
              {userTeamInviteForm}
            </Stack>
          }
          fullscreen={!smUp}
        >
          <Stack spacing={4}>
            <Typography variant="subtitle1">{t('Members')}</Typography>
            {userTeamList}
            {userTeamInviteList}
          </Stack>
        </Dialog>
      )}
    </TeamManageWrapper>
  )
}
