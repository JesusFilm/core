import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { SignInServiceButton } from '../SignInServiceButton'
import { PageProps } from '../types'

interface EmailUsedPageProps extends PageProps {
  activePage: 'google.com' | 'facebook.com'
}

export function EmailUsedPage({
  activePage,
  userEmail
}: EmailUsedPageProps): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <Typography variant="h6" textAlign="left">
        {t('You already have an account')}
      </Typography>
      <Typography>
        {t("You've already used ")}
        <Box sx={{ fontWeight: 'bold', display: 'inline' }}>{userEmail}</Box>
        {t(` Sign in with {{service}} to continue`, {
          service: activePage === 'google.com' ? t('Google') : t('Facebook')
        })}
      </Typography>
      <SignInServiceButton service={activePage} />
    </>
  )
}
