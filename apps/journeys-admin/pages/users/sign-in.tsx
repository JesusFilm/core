import absoluteUrl from 'next-absolute-url'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { getAppRedirectDestination } from '../../src/libs/firebaseClient/initAuth'

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

export const getServerSideProps = withUserTokenSSR()(async ({
  user,
  locale,
  req
}) => {
  // Don't redirect anonymous users; they should see the sign-in page.
  const firebaseClaim = user?.claims?.firebase as { sign_in_provider?: string } | undefined
  const signInProvider = firebaseClaim?.sign_in_provider
  const isAnonymous =
    user?.firebaseUser?.isAnonymous ?? (signInProvider == null || signInProvider === 'anonymous')
  if (user?.id != null && !isAnonymous) {
    const origin = absoluteUrl(req).origin
    const searchParams = new URL(req.url ?? '', origin).searchParams
    const destination = getAppRedirectDestination(searchParams)
    return { redirect: { destination, permanent: false } }
  }

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

export default withUser()(SignInPage)
