import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TermsAndConditions } from '../../src/components/TermsAndConditions'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useHandleNewAccountRedirect } from '../../src/libs/useRedirectNewAccount'

function TermsAndConditionsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const title = t('Terms and Conditions')
  const user = useUser()

  useHandleNewAccountRedirect()

  return (
    <>
      <NextSeo title={title} />
      <OnboardingPageWrapper
        title={title}
        emailSubject={t('A question about the terms and conditions form')}
        user={user}
      >
        <TermsAndConditions />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations, apolloClient } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TermsAndConditionsPage)
