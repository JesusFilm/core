import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { SignInServiceButton } from '../SignInServiceButton'
import { PageProps } from '../types'

interface EmailUsedPageProps extends PageProps {
  activePage: 'google.com' | 'facebook.com'
}

export function EmailUsedPage({
  activePage,
  userEmail
}: EmailUsedPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Typography variant="h6" textAlign="left">
        {t('You already have an account')}
      </Typography>
      <Typography>
        {t("You've already used {{userEmail}}.", { userEmail })}{' '}
        {t('Sign in with {{service}} to continue', {
          service: activePage === 'google.com' ? t('Google') : t('Facebook')
        })}
      </Typography>
      <SignInServiceButton service={activePage} />
    </>
  )
}
