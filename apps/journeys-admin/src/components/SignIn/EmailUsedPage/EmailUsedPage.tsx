import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { SignInServiceButton } from '../SignInServiceButton'

interface EmailUsedPageProps {
  userEmail: string
  variant: 'Google' | 'Facebook'
}
export function EmailUsedPage({
  userEmail,
  variant
}: EmailUsedPageProps): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <Typography variant="h5" textAlign="left">
        {t('You already have an account')}
      </Typography>
      <Box>
        <Typography>{t("You've already used")}</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t(`${userEmail}.`)}
        </Typography>
        <Typography>
          {t(
            `Sign in with ${
              variant === 'Google' ? 'Google' : 'Facebook'
            } to continue.`
          )}
        </Typography>
      </Box>
      <SignInServiceButton variant={variant} />
    </>
  )
}
