import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import { JourneyList } from '../src/components/JourneyList'
import { OnboardingPanel } from '../src/components/OnboardingPanel'
import { PageWrapper } from '../src/components/PageWrapper'
import { SidePanelTitle } from '../src/components/SidePanelTitle/SidePanelTitle'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { useAuth } from '../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

export default function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const router = useRouter()
  const { query, activeTeam, refetch } = useTeam()

  useEffect(() => {
    if (activeTeam == null) {
      void refetch()
    }
  }, [user?.id, query, activeTeam, refetch])

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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract(),
      ...translations,
      flags
    }
  }
}
