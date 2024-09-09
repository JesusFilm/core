/* eslint-disable i18next/no-literal-string */
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
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
import { StrategiesView } from '../../src/components/StrategiesView'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'

interface StrategiesPageProps {
  intitialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
}

function StrategiesPage({
  intitialApolloState,
  serverState
}: StrategiesPageProps): ReactElement {
  const baseUrl = (process.env.NEXT_PUBLIC_WATCH_URL ?? '').replace(
    '/watch',
    ''
  )

  const client = useApolloClient({
    initialState: intitialApolloState
  })

  const searchClient = useInstantSearchClient()

  return (
    <InstantSearchSSRProvider {...serverState}>
      <ApolloProvider client={client}>
        <InstantSearch
          searchClient={searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
          insights
          routing={{
            router: createInstantSearchRouterNext({
              serverUrl: `${baseUrl}/strategies`,
              singletonRouter,
              routerOptions: {
                cleanUrlOnDispose: false
              }
            })
          }}
        >
          <StrategiesView />
        </InstantSearch>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<StrategiesPageProps> = async ({
  locale
}) => {
  const flags = await getFlags()

  if (flags.strategies !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  const serverState = await getServerState(<StrategiesPage />, {
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

export default StrategiesPage
