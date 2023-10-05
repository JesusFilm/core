import { Form } from '@formium/types'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { formiumClient } from '@core/shared/ui/formiumClient'
import { FormiumProvider } from '@core/shared/ui/FormiumProvider'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { OnboardingForm } from '../../src/components/OnboardingForm'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface OnboardingFormPageProps {
  form: Form
}

function OnboardingFormPage({ form }: OnboardingFormPageProps): ReactElement {
  const AuthUser = useAuthUser()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t('A Few Questions')} />
      <FormiumProvider
        value={{ submitText: 'Next', submitIcon: <ArrowRightIcon /> }}
      >
        <OnboardingPageWrapper
          emailSubject={t('a question about onboarding form')}
        >
          <OnboardingForm form={form} authUser={AuthUser} />
        </OnboardingPageWrapper>
      </FormiumProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  const form = await formiumClient.getFormBySlug('ns-onboarding-form')

  return {
    props: {
      form,
      flags,
      ...translations
    }
  }
})

export default withAuthUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
