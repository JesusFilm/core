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
