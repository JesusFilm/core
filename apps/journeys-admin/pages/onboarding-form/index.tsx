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
import { FormiumProvider } from '@core/shared/ui/FormiumProvider'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { OnboardingForm } from '../../src/components/OnboardingForm'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface OnboardingFormPageProps {
  form: Form
}

function OnboardingFormPage({ form }: OnboardingFormPageProps): ReactElement {
  const AuthUser = useUser()
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

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, translations } = await initAndAuthApp({
    user,
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

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
