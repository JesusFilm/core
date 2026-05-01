import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { GET_JOURNEY_TEMPLATE_LANGUAGE_IDS } from '@core/journeys/ui/TemplateGallery/HeaderAndLanguageFilter'
import { GET_JOURNEYS } from '@core/journeys/ui/useJourneysQuery'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'

import {
  GetJourneys,
  GetJourneysVariables
} from '../../__generated__/GetJourneys'
import {
  GetLanguages,
  GetLanguagesVariables
} from '../../__generated__/GetLanguages'
import { GetMe } from '../../__generated__/GetMe'
import { GetTags } from '../../__generated__/GetTags'
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
import { JOURNEY_NOT_FOUND_ERROR } from '../../src/components/TemplateCustomization/utils/customizationRoutes/customizationRoutes'
import { useAuth } from '../../src/libs/auth'
import { getAuthTokens, toUser } from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function TemplateIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useQuery<GetMe>(GET_ME)
  const { query } = useTeam()
  if (
    data?.me?.__typename === 'AuthenticatedUser' &&
    data.me.id != null &&
    data.me.emailVerified === false
  ) {
    void router.push('/users/verify?redirect=/templates')
  }

  useEffect(() => {
    void query.refetch()
  }, [user?.id, query])

  useEffect(() => {
    if (!router.isReady || router.query.error !== JOURNEY_NOT_FOUND_ERROR)
      return
    enqueueSnackbar(t('Journey not found. Redirected to templates.'), {
      variant: 'error',
      preventDuplicate: true
    })
    // Clear the error query param so the URL is clean and refresh won't re-show the message
    void router.replace('/templates', undefined, { shallow: true })
  }, [router.isReady, router.query.error, router, enqueueSnackbar, t])

  const userSignedIn = user?.id != null

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        mainBodyPadding={false}
        showMainHeader={false}
        showAppHeader={userSignedIn}
        showNavBar={userSignedIn}
        fadeInNavBar
        backgroundColor="background.paper"
      >
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            top: 8,
            display: { xs: userSignedIn ? 'none' : 'block', md: 'block' }
          }}
        >
          <HelpScoutBeacon
            userInfo={{
              name: user?.displayName ?? '',
              email: user?.email ?? ''
            }}
          />
        </Box>
        <Box
          sx={{
            maxWidth: { md: '90vw' },
            px: { xs: 6, sm: 8, md: 10 }
          }}
        >
          <TemplateGallery />
        </Box>
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  const user = tokens != null ? toUser(tokens) : null

  const { apolloClient, redirect, translations, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl,
    allowGuest: true
  })

  if (redirect != null) return { redirect }

  // Fetch dynamic template language IDs first (sequential — result feeds into GET_LANGUAGES)
  const { data: languageIdsData } = await apolloClient.query<{
    journeyTemplateLanguageIds: string[]
  }>({
    query: GET_JOURNEY_TEMPLATE_LANGUAGE_IDS
  })
  const templateLanguageIds = languageIdsData?.journeyTemplateLanguageIds
  if (templateLanguageIds == null || templateLanguageIds.length === 0) {
    console.warn(
      'journeyTemplateLanguageIds returned empty or null — language dropdown will be empty'
    )
  }

  // Then fetch languages, tags, and journeys in parallel
  await Promise.all([
    apolloClient.query<GetLanguages, GetLanguagesVariables>({
      query: GET_LANGUAGES,
      variables: {
        languageId: '529',
        where: {
          ids: templateLanguageIds ?? []
        }
      }
    }),
    apolloClient.query<GetTags>({
      query: GET_TAGS
    }),
    apolloClient.query<GetJourneys, GetJourneysVariables>({
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds: undefined,
          languageIds: ['529'],
          teamId: 'jfp-team'
        }
      }
    })
  ])

  return {
    props: {
      userSerialized: user != null ? JSON.stringify(user) : null,
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

export default TemplateIndexPage
