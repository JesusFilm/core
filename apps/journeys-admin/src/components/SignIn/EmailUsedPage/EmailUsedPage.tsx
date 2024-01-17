import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageProps } from '../HomePage/HomePage'
import { SignInServiceButton } from '../SignInServiceButton'

export function EmailUsedPage({ userEmail, variant }: PageProps): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <Typography variant="h6" textAlign="left">
        {t('You already have an account')}
      </Typography>
      <Box>
        <Typography>{t("You've already used")}</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>{userEmail}</Typography>
        <Typography>
          {t(`Sign in with {{service}} to continue.`, {
            service: variant === 'Google' ? t('Google') : t('Facebook')
          })}
        </Typography>
      </Box>
      <SignInServiceButton variant={variant} />
    </>
  )
}
