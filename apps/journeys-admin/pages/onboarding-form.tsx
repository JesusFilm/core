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

import { formiumClient } from '@core/shared/ui/formiumClient'

import { OnboardingForm } from '../src/components/OnboardingForm'
import { OnboardingPageWrapper } from '../src/components/OnboardingPageWrapper'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

interface OnboardingFormPageProps {
  form: Form
}

function OnboardingFormPage({ form }: OnboardingFormPageProps): ReactElement {
  const user = useUser()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t('A Few Questions')} />
      <OnboardingPageWrapper
        emailSubject={t('a question about onboarding form')}
      >
        <OnboardingForm form={form} user={user} />
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

  const form = await formiumClient.getFormBySlug(
    process.env.NEXT_PUBLIC_FORMIUM_PROJECT_SLUG ?? ''
  )

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      form,
      ...translations
    }
  }
})

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
