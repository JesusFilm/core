import { ApolloProvider, NormalizedCacheObject, gql } from '@apollo/client'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import singletonRouter from 'next/router'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  InstantSearch,
  InstantSearchSSRProvider,
  InstantSearchServerState,
  getServerState
} from 'react-instantsearch'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import algoliasearch from 'algoliasearch'
import { UiState } from 'instantsearch.js'
import i18nConfig from '../../next-i18next.config'
import { Videos } from '../../src/components/VideosPage'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'
import { VIDEO_CHILD_FIELDS } from '../../src/libs/videoChildFields'

const GET_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      ...VideoChildFields
    }
  }
`

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

interface VideosPageProps {
  initialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
}

function VideosPage({
  serverState,
  initialApolloState
}: VideosPageProps): ReactElement {
  const client = useApolloClient({
    initialState: initialApolloState
  })

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <InstantSearch
          insights
          searchClient={searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
          routing={{
            router: createInstantSearchRouterNext({
              serverUrl: 'http://localhost:4300/watch/videos',
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
          }}
        >
          <Videos index />
        </InstantSearch>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<VideosPageProps> = async ({
  locale
}) => {
  const serverState = await getServerState(<VideosPage />, {
    renderToString
  })

  const apolloClient = createApolloClient()

  await apolloClient.query({
    query: GET_VIDEOS,
    variables: {
      where: {},
      offset: 0,
      limit: 20,
      languageId: '529'
    }
  })
  await apolloClient.query({
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  })

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
export default VideosPage
