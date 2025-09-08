import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TemplateView } from '@core/journeys/ui/TemplateView'
import { GET_JOURNEY, useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'
import { GET_JOURNEYS } from '@core/journeys/ui/useJourneysQuery'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'

import { GetJourney, GetJourneyVariables } from '../../__generated__/GetJourney'
import {
  GetJourneys,
  GetJourneysVariables
} from '../../__generated__/GetJourneys'
import { GetTags } from '../../__generated__/GetTags'
import { IdType } from '../../__generated__/globalTypes'
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function TemplateDetailsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId
  })
  const { activeTeam, refetch, query } = useTeam()

  useEffect(() => {
    if (activeTeam == null) {
      void refetch()
    }
  }, [user.id, query, activeTeam, refetch])

  const userSignedIn = user?.id != null
  const isAnonymous = user?.email == null

  return (
    <>
      <NextSeo
        title={data?.journey?.title ?? t('Journey Template')}
        description={data?.journey?.description ?? undefined}
      />
      <JourneyProvider
        value={{
          journey: data?.journey,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={t('Journey Template')}
          user={user}
          backHref="/templates"
          mainBodyPadding={false}
          showMainHeader={userSignedIn && !isAnonymous}
          mainHeaderChildren={
            <Stack
              direction="row"
              justifyContent="flex-end"
              flexGrow={1}
              alignItems="center"
              gap={3}
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
          showAppHeader={userSignedIn && !isAnonymous}
          showNavBar={userSignedIn && !isAnonymous}
          background="background.paper"
        >
          <Box
            sx={{
              position: 'absolute',
              right: 16,
              top: 8,
              display: userSignedIn && !isAnonymous ? 'none' : 'block'
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
            <TemplateView authUser={user} />
          </Box>
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps: GetStaticProps = withUserTokenSSR()(async ({
  user,
  locale,
  resolvedUrl,
  params
}) => {
  const { redirect, apolloClient, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl,
    allowAnonymous: true
  })

  if (params?.journeyId == null) {
    return {
      redirect: {
        destination: '/templates',
        permanent: false
      }
    }
  }

  if (redirect != null) return { redirect }

  try {
    // TemplateDetailsPage
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: params.journeyId.toString(),
        idType: IdType.databaseId
      }
    })
    const tagIds = data.journey.tags.map((tag) => tag.id)
    // src/components/TemplateView/TemplateView.tsx useJourneysQuery
    await apolloClient.query<GetJourneys, GetJourneysVariables>({
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds
        }
      }
    })
    // src/components/TemplateView/TemplateTags/TemplateTags.tsx useTagsQuery
    await apolloClient.query<GetTags>({
      query: GET_TAGS
    })
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          destination: '/templates',
          permanent: false
        }
      }
    }
    throw error
  }

  return {
    props: {
      ...translations,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser()(TemplateDetailsPage)
