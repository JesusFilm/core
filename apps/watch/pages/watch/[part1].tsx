import { ApolloProvider, NormalizedCacheObject, gql } from '@apollo/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
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
import { LANGUAGE_MAPPINGS, LocaleMapping } from '../../src/libs/localeMapping'
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
  const { i18n } = useTranslation()

  const searchClient = useInstantSearchClient()
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const initialWatchState = {
    siteLanguage: i18n?.language ?? 'en',
    audioLanguage: getCookie('AUDIO_LANGUAGE') ?? languageId,
    subtitleLanguage: getCookie('SUBTITLE_LANGUAGE') ?? languageId,
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
            routing={createInstantSearchRouter({
              defaults: {
                refinementList: {
                  languageEnglishName: [languageEnglishName]
                }
              }
            })}
          >
            <Configure ruleContexts={['home_page']} />
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
  const mapping = LANGUAGE_MAPPINGS[key!]
  const serverState = await getServerState(
    <HomeLanguagePage
      languageEnglishName={mapping.nativeName}
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
      languageEnglishName: mapping.nativeName,
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
