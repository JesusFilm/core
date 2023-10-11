import { Form } from '@formium/types'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

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

  const { flags, redirect, translations } = await initAndAuthApp({
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
      form,
      flags,
      ...translations
    }
  }
})

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
