import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TeamOnboarding } from '../../src/components/Team/TeamOnboarding'
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from '../../src/components/Team/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../src/components/Team/TeamSelect/TeamSelect'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_CURRENT_USER } from '../../src/libs/useCurrentUserLazyQuery'

function TeamsNewPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t('New Team')} />
      <OnboardingPageWrapper
        emailSubject={t('A question about creating a team for the first time.')}
      >
        <TeamOnboarding />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  // Needed to populate user team list, do not remove:
  await apolloClient.query({ query: GET_CURRENT_USER })

  // check if user has been invited to a team but has no active team:
  const { data } = await apolloClient.query({
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
    errorPolicy: 'none'
  })

  // set active team to invited team and redirect:
  if (data.teams.length > 0 && data.teams[0].id != null) {
    await apolloClient.mutate({
      mutation: UPDATE_LAST_ACTIVE_TEAM_ID,
      variables: {
        input: {
          lastActiveTeamId: data.teams[0].id
        }
      }
    })
    return {
      redirect: {
        permanent: false,
        destination: '/?onboarding=true'
      },
      props: {
        initialApolloState: apolloClient.cache.extract(),
        ...translations
      }
    }
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TeamsNewPage)
