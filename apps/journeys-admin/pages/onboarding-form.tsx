import { Form } from '@formium/types'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { formiumClient } from '@core/shared/ui/formiumClient'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../next-i18next.config'
import { OnboardingForm } from '../src/components/OnboardingForm'
import { OnboardingPageWrapper } from '../src/components/OnboardingPageWrapper'
import { createApolloClient } from '../src/libs/apolloClient'
import { checkConditionalRedirect } from '../src/libs/checkConditionalRedirect'

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
        <OnboardingForm form={form} authUser={user} />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const ldUser = {
    key: user.id as string,
    firstName: user.displayName ?? undefined,
    email: user.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const token = await user.getIdToken()
  const apolloClient = createApolloClient(token != null ? token : '')

  const redirect = await checkConditionalRedirect(apolloClient, {
    ...flags,
    onboardingForm: false,
    teams: false
  })
  if (redirect != null) return { redirect }

  const form = await formiumClient.getFormBySlug(
    process.env.NEXT_PUBLIC_FORMIUM_PROJECT_SLUG ?? ''
  )

  return {
    props: {
      form,
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
