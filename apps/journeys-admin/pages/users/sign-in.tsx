import { AuthAction, withUser, withUserTokenSSR, useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { SignIn } from '../../src/components/SignIn'

function SignInPage(): ReactElement {
  const user = useUser()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <NextSeo title={t('Sign In')} />
      <OnboardingPageWrapper
        title={t('Create New Account or Log in')}
        emailSubject={t('A question about sign in')}
        user={user}
      >
        <SignIn />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(SignInPage)
