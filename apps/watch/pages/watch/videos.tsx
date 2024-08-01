import { ApolloProvider, NormalizedCacheObject, gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import singletonRouter from 'next/router'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  InstantSearch,
  InstantSearchProps,
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
  serverUrl?: string
}

function VideosPage({
  serverState,
  serverUrl,
  initialApolloState
}: VideosPageProps): ReactElement {
  const client = useApolloClient({
    initialState: initialApolloState
  })

  const onStateChange: InstantSearchProps['onStateChange'] = ({
    uiState,
    setUiState
  }) => {
    // Ensure there is always one languageId set and defaults to english
    const languageIds =
      uiState['video-variants-stg'].refinementList?.languageId || []
    if (languageIds.length !== 1) {
      const lastSelectedLanguage = languageIds.pop()
      setUiState({
        ...uiState,
        'video-variants-stg': {
          ...uiState['video-variants-stg'],
          refinementList: {
            ...uiState['video-variants-stg'].refinementList,
            languageId: [lastSelectedLanguage ?? '529']
          }
        }
      })
    } else {
      setUiState(uiState)
    }
  }

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <InstantSearch
          insights
          searchClient={searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
          onStateChange={onStateChange}
          routing={{
            router: createInstantSearchRouterNext({
              serverUrl: serverUrl,
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

export const getServerSideProps: GetServerSideProps<VideosPageProps> = async ({
  req,
  locale
}) => {
  const protocol = req.headers.referer?.split('://')[0] || 'https'
  const serverUrl = `${protocol}://${req.headers.host}${req.url}`
  const serverState = await getServerState(
    <VideosPage serverUrl={serverUrl} />,
    {
      renderToString
    }
  )

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
    props: {
      flags: await getFlags(),
      serverState,
      serverUrl,
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
