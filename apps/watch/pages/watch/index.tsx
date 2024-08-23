import { ApolloProvider, NormalizedCacheObject, gql } from '@apollo/client'
import algoliasearch from 'algoliasearch'
import type { UiState } from 'instantsearch.js'
import type { RouterProps } from 'instantsearch.js/es/middlewares'
import type { GetStaticProps } from 'next'
import singletonRouter from 'next/router'
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
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'

import i18nConfig from '../../next-i18next.config'
import { WatchHomePage as VideoHomePage } from '../../src/components/WatchHomePage'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'
import { VIDEO_CHILD_FIELDS } from '../../src/libs/videoChildFields'

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
    videos(where: { ids: $ids }) {
      ...VideoChildFields
    }
  }
`

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_SERVER_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
    ''
)

interface HomePageProps {
  initialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
}

export const nextRouter: RouterProps = {
  // Manages the URL paramers with instant search state
  router: createInstantSearchRouterNext({
    serverUrl: process.env.NEXT_PUBLIC_WATCH_URL,
    singletonRouter,
    routerOptions: {
      cleanUrlOnDispose: false
    }
  }),
  stateMapping: {
    stateToRoute(uiState) {
      return uiState[
        process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''
      ] as unknown as UiState
    },
    routeToState(routeState) {
      return {
        [process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? '']: routeState
      }
    }
  }
}

function HomePage({
  initialApolloState,
  serverState
}: HomePageProps): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const client = useApolloClient({
    initialState: initialApolloState
  })

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <InstantSearch
          insights
          indexName={indexName}
          searchClient={searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
          stalledSearchDelay={500}
          routing={nextRouter}
        >
          <Configure ruleContexts={['home_page']} />
          <VideoHomePage />
        </InstantSearch>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async ({
  locale
}) => {
  const serverState = await getServerState(<HomePage />, {
    renderToString
  })

  const apolloClient = createApolloClient()

  return {
    revalidate: 3600,
    props: {
      flags: await getFlags(),
      serverState,
      initialApolloState: apolloClient.cache.extract(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default HomePage
