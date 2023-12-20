import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { GoogleButton } from '../GoogleButton'
import type { ActivePage } from '../SignIn'

interface GooglePageProps {
  setActivePage: (activePage: ActivePage) => void
  userEmail: string
}
export function GooglePage({ userEmail }: GooglePageProps): ReactElement {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant="h5" textAlign="left">
        {t('Sign In')}
      </Typography>
      <Typography variant="h5" textAlign="left">
        {t('You already have an account')}
      </Typography>
      <Box>
        <Typography>{t("You've already used")}</Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>{t(`${userEmail}`)}</span>{' '}
          {t('Sign in with')}
        </Typography>
        <Typography>{t('Google to continue')}</Typography>
      </Box>
      <GoogleButton />
    </>
  )
}
