import Stack from '@mui/material/Stack'
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

import { JourneyList } from '../src/components/JourneyList'
import { OnboardingPanel } from '../src/components/OnboardingPanel'
import { PageWrapper } from '../src/components/PageWrapper'
import { SidePanelTitle } from '../src/components/SidePanelTitle/SidePanelTitle'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

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

  // Only show side panel (OnboardingPanel) when on journeys tab, not templates tab
  const currentContentType =
    (router?.query?.type as 'journeys' | 'templates') ?? 'journeys'
  const showSidePanel = currentContentType === 'journeys'

  const userInfo = {
    name: user?.displayName ?? '',
    email: user?.email ?? ''
  }

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
        sidePanelChildren={showSidePanel ? <OnboardingPanel /> : undefined}
        sidePanelTitle={
          showSidePanel ? (
            <SidePanelTitle name={userInfo.name} email={userInfo.email} />
          ) : undefined
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
