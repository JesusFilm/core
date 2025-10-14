/* eslint-disable i18next/no-literal-string */
import { NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from "@apollo/client/react";
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  InstantSearch,
  InstantSearchSSRProvider,
  InstantSearchServerState,
  getServerState
} from 'react-instantsearch'

import { useInstantSearchClient } from '@core/journeys/ui/algolia/InstantSearchProvider'

import i18nConfig from '../../next-i18next.config'
import { ResourcesView } from '../../src/components/ResourcesView'
import { indexes } from '../../src/components/ResourcesView/ResourceSections/ResourceSections'
import { createInstantSearchRouter } from '../../src/libs/algolia/instantSearchRouter/instantSearchRouter'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'

interface ResourcesPageProps {
  intitialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
}

function ResourcesPage({
  intitialApolloState,
  serverState
}: ResourcesPageProps): ReactElement {
  const client = useApolloClient({
    initialState: intitialApolloState
  })

  const searchClient = useInstantSearchClient()

  const baseUrl = (process.env.NEXT_PUBLIC_WATCH_URL ?? '').replace(
    '/watch',
    ''
  )
  const nextRouter = createInstantSearchRouter({
    indexName: indexes[0],
    serverUrl: `${baseUrl}/resources`
  })

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
