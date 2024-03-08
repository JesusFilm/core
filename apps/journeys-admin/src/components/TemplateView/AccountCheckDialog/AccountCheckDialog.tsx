import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface AccountCheckDialogProps {
  open: boolean
  onClose: () => void
  handleSignIn: () => void
}

export function AccountCheckDialog({
  open,
  onClose,
  handleSignIn
}: AccountCheckDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Great Choice!') }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 2,
          width: 378,
          py: 2
        },
        '& .MuiDialogTitle-root': {
          justifyContent: 'center'
        }
      }}
    >
      <Stack gap={4} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" align="center" gutterBottom>
          {t('Create a new account or log in to use this template')}
        </Typography>
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          fullWidth
          onClick={handleSignIn}
        >
          {t('Log in with my account')}
        </Button>
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          fullWidth
          onClick={handleSignIn}
        >
          {t('Create a new account')}
        </Button>
      </Stack>
    </Dialog>
  )
}
