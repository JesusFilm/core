import { ApolloProvider, NormalizedCacheObject, gql } from '@apollo/client'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  Configure,
  InstantSearch,
  InstantSearchSSRProvider,
  type InstantSearchServerState,
  getServerState
} from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import i18nConfig from '../../next-i18next.config'
import { WatchHomePage as VideoHomePage } from '../../src/components/WatchHomePage'
import { createInstantSearchRouter } from '../../src/libs/algolia/instantSearchRouter/instantSearchRouter'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getCookie } from '../../src/libs/cookieHandler'
import { getFlags } from '../../src/libs/getFlags'
import { getLanguageIdFromLocale } from '../../src/libs/getLanguageIdFromLocale'
import { VIDEO_CHILD_FIELDS } from '../../src/libs/videoChildFields'
import { WatchProvider } from '../../src/libs/watchContext/WatchContext'

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
    videos(where: { ids: $ids }) {
      ...VideoChildFields
    }
  }
`

interface HomePageProps {
  initialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
  localLanguageId?: string
}

function HomePage({
  initialApolloState,
  serverState,
  localLanguageId
}: HomePageProps): ReactElement {
  const client = useApolloClient({
    initialState: initialApolloState
  })
  const { i18n } = useTranslation()

  const searchClient = useInstantSearchClient()
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const initialWatchState = {
    siteLanguage: i18n?.language ?? 'en',
    audioLanguage: getCookie('AUDIO_LANGUAGE') ?? '529',
    subtitleLanguage: getCookie('SUBTITLE_LANGUAGE') ?? '529',
    subtitleOn: (getCookie('SUBTITLES_ON') ?? 'false') === 'true'
  }

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <WatchProvider initialState={initialWatchState}>
          <InstantSearch
            searchClient={searchClient}
            indexName={indexName}
            stalledSearchDelay={500}
            future={{ preserveSharedStateOnUnmount: true }}
            insights
            routing={createInstantSearchRouter()}
          >
            <Configure ruleContexts={[`home_page_${localLanguageId}`]} />
            <VideoHomePage languageId={localLanguageId} />
          </InstantSearch>
        </WatchProvider>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async ({
  locale
}) => {
  const currentLocale = locale ?? 'en'
  const localLanguageId = getLanguageIdFromLocale(currentLocale)

  const serverState = await getServerState(
    <HomePage localLanguageId={localLanguageId} />,
    {
      renderToString
    }
  )

  const apolloClient = createApolloClient()

  return {
    revalidate: 3600,
    props: {
      flags: await getFlags(),
      serverState,
      localLanguageId,
      initialApolloState: apolloClient.cache.extract(),
      ...(await serverSideTranslations(
        currentLocale,
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default HomePage
