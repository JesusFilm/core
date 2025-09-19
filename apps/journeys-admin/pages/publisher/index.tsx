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
import { useUserRoleQuery } from '@core/journeys/ui/useUserRoleQuery'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../__generated__/GetAdminJourneys'
import { JourneyStatus, Role } from '../../__generated__/globalTypes'
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateList } from '../../src/components/TemplateList'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEYS } from '../../src/libs/useAdminJourneysQuery/useAdminJourneysQuery'

function PublisherIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const { query, activeTeam, refetch } = useTeam()

  const { data } = useUserRoleQuery()

  // Ensure team is refetched if user is not loaded before provider
  useEffect(() => {
    if (activeTeam == null) {
      void refetch()
    }
  }, [user.id, query, activeTeam, refetch])

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

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl, query }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  let variables: GetAdminJourneysVariables = {}

  switch (query.tab ?? 'active') {
    case 'active':
      variables = {
        // from src/components/TemplateList/ActiveTemplateList useAdminJourneysQuery
        status: [JourneyStatus.draft, JourneyStatus.published],
        template: true
      }
      break
    case 'archived':
      variables = {
        // from src/components/TemplateList/ArchivedTemplateList useAdminJourneysQuery
        status: [JourneyStatus.archived],
        template: true
      }
      break
    case 'trashed':
      variables = {
        // from src/components/TemplateList/TrashedTemplateList useAdminJourneysQuery
        status: [JourneyStatus.trashed],
        template: true
      }
      break
  }

  await apolloClient.query<GetAdminJourneys, GetAdminJourneysVariables>({
    query: GET_ADMIN_JOURNEYS,
    variables
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
})

export default withUser({
  // whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(PublisherIndexPage)
