import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ACCEPT_ALL_INVITES } from '..'
import { AcceptAllInvites } from '../../__generated__/AcceptAllInvites'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TermsAndConditions } from '../../src/components/TermsAndConditions'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function TermsAndConditionsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <NextSeo title={t('Terms and Conditions')} />
      <OnboardingPageWrapper
        emailSubject={t('A question about the terms and conditions form')}
      >
        <TermsAndConditions />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, req, query, params, resolvedUrl }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  console.log('t&c page ---', req.url, query, params, resolvedUrl)

  const { apolloClient, redirect, flags, translations } = await initAndAuthApp({
    AuthUser,
    locale,
    encodedRedirectPathname:
      resolvedUrl != null ? encodeURIComponent(resolvedUrl) : undefined,
    pageSource: 'terms-and-conditions'
  })

  console.log('redirect from t&c', redirect)

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TermsAndConditionsPage)
