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
  handleSignIn: (login: boolean) => void
}

export function AccountCheckDialog({
  open,
  onClose,
  handleSignIn
}: AccountCheckDialogProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiPaper-root': {
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: { xs: 0, sm: 8 },
          borderBottomRightRadius: { xs: 0, sm: 8 },
          justifyContent: { xs: 'flex-start', sm: 'center' },
          width: { xs: '100%', sm: 418 },
          px: { xs: 6, sm: 8 },
          pt: { xs: 6, sm: 9 },
          pb: { xs: 12, sm: 9 },
          m: 0,
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0 }
        }
      }}
    >
      <Stack gap={9}>
        <Stack gap={3} px={3}>
          <Typography variant="h3" align="center">
            {t('We Like Your Choice!')}
          </Typography>
          <Typography variant="body1" align="center">
            {t('Create a new account or log in to use this template as yours.')}
          </Typography>
        </Stack>
        <Stack gap={5} width="100%">
          <Button
            startIcon={<Key2 />}
            variant="outlined"
            size="large"
            color="secondary"
            onClick={() => handleSignIn(true)}
          >
            {t('Login with my account')}
          </Button>
          <Button
            startIcon={<UserProfileCircle />}
            variant="outlined"
            size="large"
            color="secondary"
            onClick={() => handleSignIn(false)}
          >
            {t('Create a new account')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
