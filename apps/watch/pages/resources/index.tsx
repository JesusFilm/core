/* eslint-disable i18next/no-literal-string */
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import algoliasearch from 'algoliasearch'
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

import i18nConfig from '../../next-i18next.config'
import { ResourcesView } from '../../src/components/ResourcesView'
import {
  createApolloClient,
  useApolloClient
} from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_SERVER_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ??
    ''
)

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
          <ResourcesView />
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
