import { ApolloError, gql } from '@apollo/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import {
  GetLanguagesSlug,
  GetLanguagesSlugVariables,
  GetLanguagesSlug_video_variantLanguagesWithSlug as VideoAudioLanguage
} from '../../../__generated__/GetLanguagesSlug'
import {
  GetSubtitles,
  GetSubtitlesVariables,
  GetSubtitles_video_variant_subtitle as VideoVariantSubtitle
} from '../../../__generated__/GetSubtitles'
import type {
  GetVideoContent,
  GetVideoContentVariables
} from '../../../__generated__/GetVideoContent'
import type { VideoContentFields } from '../../../__generated__/VideoContentFields'
import i18nConfig from '../../../next-i18next.config'
import { GET_SUBTITLES } from '../../../src/components/SubtitleDialog/SubtitleDialog'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getCookie } from '../../../src/libs/cookieHandler'
import { getFlags } from '../../../src/libs/getFlags'
import { getLanguageIdFromLocale } from '../../../src/libs/getLanguageIdFromLocale'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { PlayerProvider } from '../../../src/libs/playerContext/PlayerContext'
import { slugMap } from '../../../src/libs/slugMap'
import { GET_LANGUAGES_SLUG } from '../../../src/libs/useLanguagesSlugQuery'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../src/libs/videoContext'
import {
  AudioLanguageData,
  WatchInitialState,
  WatchProvider
} from '../../../src/libs/watchContext/WatchContext'
import {
  GetVariantLanguagesIdAndSlug,
  GetVariantLanguagesIdAndSlug_video_variantLanguages as VariantLanguageIdAndSlug,
  GetVariantLanguagesIdAndSlugVariables
} from '../../../__generated__/GetVariantLanguagesIdAndSlug'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

export const GET_VARIANT_LANGUAGES_ID_AND_SLUG = gql`
  query GetVariantLanguagesIdAndSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguages {
        id
        slug
      }
      subtitles {
        languageId
      }
    }
  }
`

interface Part2PageProps {
  content: VideoContentFields
  videoSubtitleLanguageIds: string[]
  videoAudioLanguagesIdsAndSlugs: AudioLanguageData[]
}

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../../src/components/VideoContainerPage'
    )
)

const DynamicNewContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "NewContentPage" */
      '../../../src/components/NewVideoContentPage'
    ).then((mod) => mod.NewVideoContentPage)
)

export default function Part2Page({
  content,
  videoSubtitleLanguageIds,
  videoAudioLanguagesIdsAndSlugs
}: Part2PageProps): ReactElement {
  const { i18n } = useTranslation()

  const initialWatchState: WatchInitialState = {
    siteLanguage: i18n?.language ?? 'en',
    audioLanguage: getCookie('AUDIO_LANGUAGE') ?? '529',
    subtitleLanguage: getCookie('SUBTITLE_LANGUAGE') ?? '529',
    subtitleOn: (getCookie('SUBTITLES_ON') ?? 'false') === 'true',
    videoId: content.id,
    videoVariantSlug: content.variant?.slug,
    videoSubtitleLanguageIds,
    videoAudioLanguagesIdsAndSlugs
  }

  return (
    <SnackbarProvider>
      <WatchProvider initialState={initialWatchState}>
        <LanguageProvider>
          <VideoProvider value={{ content }}>
            <PlayerProvider>
              {content.variant?.hls != null ? (
                <DynamicNewContentPage />
              ) : (
                <DynamicVideoContainerPage />
              )}
            </PlayerProvider>
          </VideoProvider>
        </LanguageProvider>
      </WatchProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps<Part2PageProps> = async (
  context
) => {
  const [contentId, contentIdExtension] = (
    context.params?.part1 as string
  ).split('.')
  const [languageId, languageIdExtension] = (
    context.params?.part2 as string
  ).split('.')

  if (contentIdExtension !== 'html' || languageIdExtension !== 'html')
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${encodeURIComponent(
          contentId
        )}.html/${languageId}.html`
      }
    }

  if (slugMap[languageId] != null)
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${encodeURIComponent(contentId)}.html/${
          slugMap[languageId]
        }.html`
      }
    }

  const client = createApolloClient()
  try {
    const { data: contentData } = await client.query<
      GetVideoContent,
      GetVideoContentVariables
    >({
      query: GET_VIDEO_CONTENT,
      variables: {
        id: `${contentId}/${languageId}`,
        languageId: getLanguageIdFromLocale(context.locale)
      }
    })
    if (contentData.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }

    let videoAudioLanguagesData: AudioLanguageData[] = []
    let videoSubtitleLanguageIds: string[] = []
    if (contentData.content.variant?.slug != null) {
      const { data } = await client.query<
        GetVariantLanguagesIdAndSlug,
        GetVariantLanguagesIdAndSlugVariables
      >({
        query: GET_VARIANT_LANGUAGES_ID_AND_SLUG,
        variables: {
          id: contentData.content.id
        }
      })
      videoAudioLanguagesData =
        data?.video?.variantLanguages?.map(
          ({ id, slug }): AudioLanguageData => ({
            id,
            slug
          })
        ) || []
      videoSubtitleLanguageIds = data?.video?.subtitles?.map(
        ({ languageId }) => languageId
      )
    }

    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
        content: contentData.content,
        videoSubtitleLanguageIds: videoSubtitleLanguageIds,
        videoAudioLanguagesIdsAndSlugs: videoAudioLanguagesData,
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-watch'],
          i18nConfig
        ))
      }
    }
  } catch (error) {
    if (
      error instanceof ApolloError &&
      error.graphQLErrors.some(
        ({ extensions, message }) =>
          extensions?.code === 'NOT_FOUND' ||
          message?.startsWith('Video not found')
      )
    )
      return {
        revalidate: 1,
        notFound: true
      }
    throw error
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { part1: 'jesus.html', part2: 'english.html' } },
      {
        params: {
          part1: 'life-of-jesus-gospel-of-john.html',
          part2: 'english.html'
        }
      },
      {
        params: { part1: 'jesus-calms-the-storm.html', part2: 'english.html' }
      },
      { params: { part1: 'magdalena.html', part2: 'english.html' } },
      { params: { part1: 'reflections-of-hope.html', part2: 'english.html' } },
      {
        params: { part1: 'day-6-jesus-died-for-me.html', part2: 'english.html' }
      },
      { params: { part1: 'book-of-acts.html', part2: 'english.html' } },
      { params: { part1: 'wedding-in-cana.html', part2: 'english.html' } },
      { params: { part1: 'lumo.html', part2: 'english.html' } },
      {
        params: {
          part1: 'peter-miraculous-escape-from-prison.html',
          part2: 'english.html'
        }
      },
      {
        params: {
          part1: '8-days-with-jesus-who-is-jesus.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'chosen-witness.html', part2: 'english.html' } },
      {
        params: { part1: 'lumo-the-gospel-of-luke.html', part2: 'english.html' }
      },
      {
        params: {
          part1: 'storyclubs-jesus-and-zacchaeus.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'birth-of-jesus.html', part2: 'english.html' } },
      { params: { part1: 'fallingplates.html', part2: 'english.html' } },
      {
        params: {
          part1: 'paul-and-silas-in-prison.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'my-last-day.html', part2: 'english.html' } },
      { params: { part1: 'the-beginning.html', part2: 'english.html' } }
    ],
    fallback: 'blocking'
  }
}
