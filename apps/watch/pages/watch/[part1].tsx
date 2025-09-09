import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
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
import { LANGUAGE_MAPPINGS } from '../../src/libs/localeMapping'
import {
  WatchProvider,
  WatchState
} from '../../src/libs/watchContext/WatchContext'

interface HomeLanguagePageProps {
  initialApolloState?: NormalizedCacheObject
  serverState?: InstantSearchServerState
  languageEnglishName: string
  languageId: string
}

function HomeLanguagePage({
  initialApolloState,
  serverState,
  languageEnglishName,
  languageId
}: HomeLanguagePageProps): ReactElement {
  const client = useApolloClient({
    initialState: initialApolloState
  })
  const searchClient = useInstantSearchClient()
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const initialWatchState: WatchState = {
    audioLanguageId: getCookie('AUDIO_LANGUAGE') ?? languageId,
    subtitleLanguageId: getCookie('SUBTITLE_LANGUAGE') ?? languageId,
    subtitleOn: getCookie('SUBTITLES_ON') === 'true'
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
            routing={createInstantSearchRouter({
              defaults: {
                refinementList: {
                  languageEnglishName: [languageEnglishName]
                }
              }
            })}
          >
            <Configure
              ruleContexts={['home_page']}
              filters="restrictViewPlatforms:-watch AND published:true AND videoPublished:true"
            />
            <VideoHomePage languageId={languageId} />
          </InstantSearch>
        </WatchProvider>
      </ApolloProvider>
    </InstantSearchSSRProvider>
  )
}

export const getStaticProps: GetStaticProps<HomeLanguagePageProps> = async ({
  params
}) => {
  const key = Object.keys(LANGUAGE_MAPPINGS).find((key) => {
    return LANGUAGE_MAPPINGS[key].languageSlugs.includes(
      params!.part1 as string
    )
  })
  if (key == null) {
    return {
      notFound: true,
      revalidate: 60
    }
  }
  const mapping = LANGUAGE_MAPPINGS[key]
  const serverState = await getServerState(
    <HomeLanguagePage
      languageEnglishName={mapping.englishName}
      languageId={mapping.languageId}
    />,
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
      languageEnglishName: mapping.englishName,
      languageId: mapping.languageId,
      initialApolloState: apolloClient.cache.extract(),
      ...(await serverSideTranslations(
        mapping.locale,
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(LANGUAGE_MAPPINGS).flatMap((locale) => {
    const mapping = LANGUAGE_MAPPINGS[locale]
    return mapping.languageSlugs.map((slug) => ({
      params: { part1: slug },
      locale: mapping.locale
    }))
  })

  return {
    paths,
    fallback: false
  }
}

export default HomeLanguagePage
