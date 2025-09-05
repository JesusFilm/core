import { ApolloError, gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'

import {
  GetVideoContainerPart2,
  GetVideoContainerPart2Variables
} from '../../../../__generated__/GetVideoContainerPart2'
import {
  GetVideoContentPart3,
  GetVideoContentPart3Variables
} from '../../../../__generated__/GetVideoContentPart3'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import i18nConfig from '../../../../next-i18next.config'
import { NewVideoContentPage } from '../../../../src/components/NewVideoContentPage'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { getCookie } from '../../../../src/libs/cookieHandler'
import { getFlags } from '../../../../src/libs/getFlags'
import { getLanguageIdFromLocale } from '../../../../src/libs/getLanguageIdFromLocale'
import { PlayerProvider } from '../../../../src/libs/playerContext/PlayerContext'
import { slugMap } from '../../../../src/libs/slugMap'
import { VIDEO_CONTENT_FIELDS } from '../../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../../src/libs/videoContext'
import {
  WatchProvider,
  WatchState
} from '../../../../src/libs/watchContext/WatchContext'

export const GET_VIDEO_CONTAINER_PART_2 = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContainerPart2($containerId: ID!, $languageId: ID) {
    container: video(id: $containerId, idType: slug) {
      ...VideoContentFields
    }
  }
`

export const GET_VIDEO_CONTENT_PART_3 = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContentPart3($contentId: ID!, $languageId: ID) {
    content: video(id: $contentId, idType: slug) {
      ...VideoContentFields
    }
  }
`

export const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoLanguages($id: ID!, $languageId: ID) {
    video(id: $id, idType: databaseId) {
      audioLanguages: variantLanguages {
        id
      }
      variant(languageId: $languageId) {
        subtitleLanguages: subtitle {
          languageId
        }
      }
    }
  }
`)

interface Part3PageProps {
  container: VideoContentFields
  content: VideoContentFields
  videoSubtitleLanguageIds: string[]
  videoAudioLanguageIds: string[]
}

export default function Part3Page({
  container,
  content,
  videoSubtitleLanguageIds,
  videoAudioLanguageIds
}: Part3PageProps): ReactElement {
  const audioLanguageId = content.variant?.language.id ?? '529'

  const initialWatchState: WatchState = {
    audioLanguageId: getCookie('AUDIO_LANGUAGE') ?? audioLanguageId,
    subtitleLanguageId: getCookie('SUBTITLE_LANGUAGE') ?? audioLanguageId,
    subtitleOn: getCookie('SUBTITLES_ON') === 'true',
    videoSubtitleLanguageIds,
    videoAudioLanguageIds
  }

  return (
    <SnackbarProvider>
      <WatchProvider initialState={initialWatchState}>
        <PlayerProvider>
          <VideoProvider value={{ content, container }}>
            <NewVideoContentPage />
          </VideoProvider>
        </PlayerProvider>
      </WatchProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps<Part3PageProps> = async (
  context
) => {
  const [containerId, containerIdExtension] = (
    context.params?.part1 as string
  ).split('.')
  const [contentId, contentIdExtension] = (
    context.params?.part2 as string
  ).split('.')
  const [languageId, languageIdExtension] = (
    context.params?.part3 as string
  ).split('.')

  if (
    containerIdExtension !== 'html' ||
    contentIdExtension !== undefined ||
    languageIdExtension !== 'html'
  )
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${containerId}.html/${encodeURIComponent(
          contentId
        )}/${languageId}.html`
      }
    }

  if (slugMap[languageId] != null)
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${containerId}.html/${encodeURIComponent(
          contentId
        )}/${slugMap[languageId]}.html`
      }
    }
  const client = createApolloClient()
  const languageIdFromLocale = getLanguageIdFromLocale(context.locale)
  try {
    const [{ data: containerData }, { data: contentData }] = await Promise.all([
      client.query<GetVideoContainerPart2, GetVideoContainerPart2Variables>({
        query: GET_VIDEO_CONTAINER_PART_2,
        variables: {
          containerId: `${containerId}/${languageId}`,
          languageId: languageIdFromLocale
        }
      }),
      client.query<GetVideoContentPart3, GetVideoContentPart3Variables>({
        query: GET_VIDEO_CONTENT_PART_3,
        variables: {
          contentId: `${contentId}/${languageId}`,
          languageId: languageIdFromLocale
        }
      })
    ])
    if (containerData.container == null || contentData.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }

    let audioIds: string[] = []
    let subtitleIds: string[] = []
    if (contentData.content.variant?.slug != null) {
      const { data } = await client.query({
        query: GET_VIDEO_LANGUAGES,
        variables: {
          id: contentData.content.id,
          languageId: languageIdFromLocale
        }
      })
      audioIds = data?.video?.audioLanguages?.map(({ id }) => id) ?? []
      subtitleIds =
        data?.video?.variant?.subtitleLanguages?.map(
          ({ languageId }) => languageId
        ) ?? []
    }

    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
        container: containerData.container,
        content: contentData.content,
        videoSubtitleLanguageIds: subtitleIds,
        videoAudioLanguageIds: audioIds,
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
      {
        locale: 'en',
        params: {
          part1: 'jesus.html',
          part2: 'the-beginning',
          part3: 'english.html'
        }
      }
    ],
    fallback: 'blocking'
  }
}
