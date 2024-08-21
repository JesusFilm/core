import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../__generated__/globalTypes'
import {
  UpdateLastActiveTeamId,
  UpdateLastActiveTeamIdVariables
} from '../__generated__/UpdateLastActiveTeamId'
import { HelpScoutBeacon } from '../src/components/HelpScoutBeacon'
import { JourneyList } from '../src/components/JourneyList'
import { OnboardingPanel } from '../src/components/OnboardingPanel'
import { PageWrapper } from '../src/components/PageWrapper'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEYS } from '../src/libs/useAdminJourneysQuery/useAdminJourneysQuery'

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const { query, activeTeam, refetch } = useTeam()

  // MA - ensure team is refetched if user is not loaded before provider
  useEffect(() => {
    if (activeTeam == null) {
      void refetch()
    }
  }, [user.id, query, activeTeam, refetch])

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        user={user}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <TeamSelect onboarding={router.query.onboarding === 'true'} />
            <Stack direction="row" alignItems="center">
              <TeamMenu />
            </Stack>
          </Stack>
        }
        sidePanelChildren={<OnboardingPanel />}
        sidePanelTitle={
          <>
            <Typography variant="subtitle1">
              {t('Create a New Journey')}
            </Typography>
            <HelpScoutBeacon
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
            />
          </>
        }
      >
        <JourneyList user={user} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl, query }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  let variables: GetAdminJourneysVariables = {}

  switch (query.tab ?? 'active') {
    case 'active':
      variables = {
        // from src/components/JourneyList/ActiveJourneyList useAdminJourneysQuery
        status: [JourneyStatus.draft, JourneyStatus.published],
        useLastActiveTeamId: true
      }
      break
    case 'archived':
      variables = {
        // from src/components/JourneyList/ArchivedJourneyList useAdminJourneysQuery
        status: [JourneyStatus.archived],
        useLastActiveTeamId: true
      }
      break
    case 'trashed':
      variables = {
        // from src/components/JourneyList/TrashedJourneyList useAdminJourneysQuery
        status: [JourneyStatus.trashed],
        useLastActiveTeamId: true
      }
      break
  }

  if (query?.activeTeam != null) {
    await apolloClient.mutate<
      UpdateLastActiveTeamId,
      UpdateLastActiveTeamIdVariables
    >({
      mutation: UPDATE_LAST_ACTIVE_TEAM_ID,
      variables: {
        input: { lastActiveTeamId: query.activeTeam as string }
      }
    })
  }

  await apolloClient.query<GetAdminJourneys, GetAdminJourneysVariables>({
    query: GET_ADMIN_JOURNEYS,
    variables
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      ...translations,
      flags
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
