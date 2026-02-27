import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useUserRoleQuery } from '@core/journeys/ui/useUserRoleQuery'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../__generated__/GetAdminJourneys'
import { JourneyStatus, Role } from '../../__generated__/globalTypes'
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateList } from '../../src/components/TemplateList'
import { useAuth } from '../../src/libs/auth'
import { getAuthTokens, redirectToLogin, toUser } from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEYS } from '../../src/libs/useAdminJourneysQuery/useAdminJourneysQuery'

function PublisherIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const router = useRouter()
  const { query, activeTeam, refetch } = useTeam()

  const { data } = useUserRoleQuery()

  // Ensure team is refetched if user is not loaded before provider
  useEffect(() => {
    if (activeTeam == null) {
      void refetch()
    }
  }, [user?.id, query, activeTeam, refetch])

  useEffect(() => {
    if (
      data != null &&
      data?.getUserRole?.roles?.includes(Role.publisher) !== true
    ) {
      void router.push('/templates')
    }
  }, [data, router])

  return (
    <>
      <NextSeo title={t('Templates Admin')} />
      <PageWrapper
        title={t('Templates Admin')}
        user={user}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            <HelpScoutBeacon
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
            />
          </Stack>
        }
      >
        <TemplateList />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  const user = tokens != null ? toUser(tokens) : null

  if (user == null) return redirectToLogin(ctx)

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  const variables: GetAdminJourneysVariables = {
    template: true,
    teamId: 'jfp-team'
  }

  switch (ctx.query.tab ?? 'active') {
    case 'active':
      variables.status = [JourneyStatus.draft, JourneyStatus.published]
      break
    case 'archived':
      variables.status = [JourneyStatus.archived]
      break
    case 'trashed':
      variables.status = [JourneyStatus.trashed]
      break
  }

  await apolloClient.query<GetAdminJourneys, GetAdminJourneysVariables>({
    query: GET_ADMIN_JOURNEYS,
    variables
  })

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
}

export default PublisherIndexPage
