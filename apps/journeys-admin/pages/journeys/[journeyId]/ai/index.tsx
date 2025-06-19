import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetAdminJourney,
  GetAdminJourneyVariables,
  GetAdminJourney_journey as Journey
} from '../../../../__generated__/GetAdminJourney'
import { AiChat } from '../../../../src/components/AiChat/AiChat'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY } from '../../[journeyId]'

function AiEditPage({ journey }: { journey: Journey }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  const searchClient = useInstantSearchClient()

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''}
      stalledSearchDelay={500}
    >
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <Configure
          ruleContexts={['home_page']}
          filters="label:episode OR label:featureFilm OR label:segment OR label:shortFilm"
          hitsPerPage={5}
        />
        <NextSeo title={t('Next Steps AI')} description={t('Next Steps AI')} />
        <PageWrapper
          user={user}
          mainHeaderChildren={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h6">{t('Next Steps AI')}</Typography>
            </Stack>
          }
          mainBodyPadding={false}
        >
          <Paper elevation={0} sx={{ height: '100%' }}>
            <Container
              maxWidth="md"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <AiChat variant="page" />
            </Container>
          </Paper>
        </PageWrapper>
      </JourneyProvider>
    </InstantSearch>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }
  let journey: Journey | null = null
  try {
    const { data } = await apolloClient.query<
      GetAdminJourney,
      GetAdminJourneyVariables
    >({
      query: GET_ADMIN_JOURNEY,
      variables: { id: query.journeyId as string }
    })
    if (data?.journey == null) throw new Error('journey not found')
    journey = data.journey
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          permanent: false,
          destination: '/',
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
    if (error.message === 'user is not allowed to view journey') {
      return {
        props: {
          status: 'noAccess',
          ...translations,
          flags,
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
  }

  return {
    props: {
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract(),
      journey
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(AiEditPage)
