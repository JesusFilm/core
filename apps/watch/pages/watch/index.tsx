import { gql } from '@apollo/client'
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

import algoliasearch from 'algoliasearch'
import { UiState } from 'instantsearch.js'
import i18nConfig from '../../next-i18next.config'
import { WatchHomePage as VideoHomePage } from '../../src/components/WatchHomePage'
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
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

interface HomePageProps {
  serverState?: InstantSearchServerState
}

function HomePage({ serverState }: HomePageProps): ReactElement {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        insights
        searchClient={searchClient}
        indexName="video-variants-stg"
        future={{ preserveSharedStateOnUnmount: true }}
        stalledSearchDelay={500}
        routing={{
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
        }}
      >
        <VideoHomePage />
      </InstantSearch>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async ({
  locale
}) => {
  const serverState = await getServerState(<HomePage />, {
    renderToString
  })

  return {
    revalidate: 3600,
    props: {
      flags: await getFlags(),
      serverState,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
export default HomePage
