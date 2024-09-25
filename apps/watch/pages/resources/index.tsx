/* eslint-disable i18next/no-literal-string */
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import { UiState } from 'instantsearch.js'
import { RouterProps } from 'instantsearch.js/es/middlewares'
import { GetStaticProps } from 'next'
import singletonRouter from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  InstantSearch,
  InstantSearchSSRProvider,
  InstantSearchServerState,
  getServerState
} from 'react-instantsearch'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import i18nConfig from '../../next-i18next.config'
import { ResourcesView } from '../../src/components/ResourcesView'
import { indexes } from '../../src/components/ResourcesView/ResourceSections/ResourceSections'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'

interface ResourcesPageProps {
  intitialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
}

const baseUrl = (process.env.NEXT_PUBLIC_WATCH_URL ?? '').replace('/watch', '')
const nextRouter: RouterProps = {
  // Manages the URL paramers with instant search state
  router: createInstantSearchRouterNext({
    serverUrl: `${baseUrl}/resources`,
    singletonRouter,
    routerOptions: {
      cleanUrlOnDispose: false
    }
  }),
  stateMapping: {
    stateToRoute(uiState) {
      const indexUiState = uiState[indexes[0]]

      const stateRoute = {
        query: indexUiState.query
      } as unknown as UiState

      return stateRoute
    },
    routeToState(routeState) {
      return {
        [indexes[0]]: routeState
      }
    }
  }
}

function ResourcesPage({
  intitialApolloState,
  serverState
}: ResourcesPageProps): ReactElement {
  const client = useApolloClient({
    initialState: intitialApolloState
  })

  const searchClient = useInstantSearchClient()

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <InstantSearch
          searchClient={searchClient}
          indexName={indexes[0]}
          future={{ preserveSharedStateOnUnmount: true }}
          stalledSearchDelay={500}
          insights
          routing={nextRouter}
        >
          <ResourcesView />
        </InstantSearch>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<ResourcesPageProps> = async ({
  locale
}) => {
  const flags = await getFlags()

  if (flags.strategies !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  const serverState = await getServerState(<ResourcesPage />, {
    renderToString
  })

  const apolloClient = createApolloClient()

  return {
    revalidate: 3600,
    props: {
      flags,
      serverState,
      intitialApolloState: apolloClient.cache.extract(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default ResourcesPage
