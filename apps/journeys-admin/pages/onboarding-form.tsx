import { Form } from '@formium/types'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { OnboardingPageWrapper } from '../src/components/OnboardingPageWrapper'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'
import { useHandleNewAccountRedirect } from '../src/libs/useRedirectNewAccount'

interface OnboardingFormPageProps {
  form: Form
}

function OnboardingFormPage({ form }: OnboardingFormPageProps): ReactElement {
  const user = useUser()
  const { t } = useTranslation('apps-journeys-admin')

  useHandleNewAccountRedirect()

  return (
    <>
      <NextSeo title={t('A Few Questions')} />
      <OnboardingPageWrapper
        title={t('User Insights')}
        emailSubject={t('a question about onboarding form')}
        user={user}
      >
        <></>
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

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
