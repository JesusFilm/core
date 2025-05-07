import { gql, useQuery } from '@apollo/client'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import { ReactElement } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import { AiChat } from '../../src/components/AiChat/AiChat'
import { PageWrapper } from '../../src/components/PageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function AiEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()

  const searchClient = useInstantSearchClient()

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''}
      stalledSearchDelay={500}
    >
      <Configure
        ruleContexts={['home_page']}
        filters="label:episode OR label:featureFilm OR label:segment OR label:shortFilm"
        hitsPerPage={5}
      />
      <NextSeo title={t('Next Steps A.I')} description={t('Next Steps A.I')} />
      <PageWrapper
        user={user}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Typography variant="h6">{t('Next Steps A.I')}</Typography>
          </Stack>
        }
      >
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <AiChat open={true} />
          </CardContent>
        </Card>
      </PageWrapper>
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

  return {
    props: {
      status: 'success',
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(AiEditPage)
