import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from '@core/journeys/ui/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TeamOnboarding } from '../../src/components/Team/TeamOnboarding'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_CURRENT_USER } from '../../src/libs/useCurrentUserLazyQuery'
import { useHandleNewAccountRedirect } from '../../src/libs/useRedirectNewAccount'

export default function TeamsNewPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  useHandleNewAccountRedirect()

  return (
    <>
      <NextSeo title={t('New Team')} />
      <OnboardingPageWrapper
        title={t('Create Your Workspace')}
        emailSubject={t('A question about creating a team for the first time.')}
        user={user ?? undefined}
      >
        <TeamOnboarding user={user ?? undefined} />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
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
        userSerialized: JSON.stringify(user),
        initialApolloState: apolloClient.cache.extract(),
        ...translations
      }
    }
  }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
}
