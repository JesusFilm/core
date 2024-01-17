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
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from '../src/components/Team/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../src/components/Team/TeamSelect/TeamSelect'
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

  const query = await apolloClient.query({
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  })

  if (query.data.teams[0].id != null) {
    await apolloClient.mutate({
      mutation: UPDATE_LAST_ACTIVE_TEAM_ID,
      variables: {
        input: {
          lastActiveTeamId: query.data.teams[0].id
        }
      }
    })
  }

  return {
    props: {
      form,
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
})

export default withUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
