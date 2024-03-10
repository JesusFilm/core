import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Key2 from '@core/shared/ui/icons/Key2'
import UserProfileCircle from '@core/shared/ui/icons/UserProfileCircle'

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
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 2,
          borderBottomLeftRadius: { xs: 0, sm: 8 },
          borderBottomRightRadius: { xs: 0, sm: 8 },
          height: { xs: 348, sm: 318 },
          width: { xs: '100%', sm: 418 },
          py: 9,
          px: 8,
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0 }
        }
      }}
    >
      <Stack
        gap={8}
        sx={{
          alignItems: 'center'
        }}
      >
        <Stack gap={4} px={3}>
          <Typography variant="h4" align="center">
            {t('We Like Your Choice!')}
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            {t('Create a new account or log in to use this template as yours.')}
          </Typography>
        </Stack>
        <Stack gap={5} sx={{ width: '100%' }}>
          <Button
            startIcon={<Key2 />}
            variant="outlined"
            size="large"
            color="secondary"
            onClick={handleSignIn}
            sx={{ border: 1.5, borderRadius: 2, height: 50 }}
          >
            {t('Login with my account')}
          </Button>
          <Button
            startIcon={<UserProfileCircle />}
            variant="outlined"
            size="large"
            color="secondary"
            onClick={handleSignIn}
            sx={{ border: 1.5, borderRadius: 2, height: 50 }}
          >
            {t('Create a new account')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
