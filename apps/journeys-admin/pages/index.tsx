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

import { HelpScoutBeacon } from '../src/components/HelpScoutBeacon'
import { JourneyList } from '../src/components/JourneyList'
import { OnboardingPanel } from '../src/components/OnboardingPanel'
import { PageWrapper } from '../src/components/PageWrapper'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const { activeTeam, getLastActiveTeamIdAndTeams } = useTeam()

  // MA - ensure team is refetched if user is not loaded before provider
  useEffect(() => {
    console.log('user.id', user.id)
    console.log('activeTeam', activeTeam)
    console.log(
      'activeTeam == null && user.id != null',
      activeTeam == null && user.id != null
    )

    if (activeTeam == null && user.id != null) {
      void getLastActiveTeamIdAndTeams()
    }
  }, [user.id, activeTeam, getLastActiveTeamIdAndTeams])

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
