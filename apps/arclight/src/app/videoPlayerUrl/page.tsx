import { graphql } from '@core/shared/gql'
import { notFound } from 'next/navigation'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const DEFAULT_SUB_LANGUAGE_IDS = [
  '529',
  '22658',
  '21754',
  '21753',
  '496',
  '21028'
]

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariant(id: $id) {
      id
      hls
      videoId
      subtitle {
        id
        language {
          id
          bcp47
          name(languageId: "529") {
            value
          }
        }
        vttSrc
      }
    }
  }
`)

const GET_VIDEO_TITLE = graphql(`
  query GetVideoTitle($id: ID!) {
    video(id: $id, idType: databaseId) {
      title {
        value
      }
      images {
        mobileCinematicHigh
      }
    }
  }
`)

function handleSubtitles(
  subonRaw: string | null,
  sublangidsRaw: string | null
): { activeSubLangId: string | null; acceptedSubLangIds: string[] } {
  if (
    (subonRaw === 'true' && sublangidsRaw === null) ||
    (sublangidsRaw === null && subonRaw === null)
  ) {
    return {
      activeSubLangId: null,
      acceptedSubLangIds: DEFAULT_SUB_LANGUAGE_IDS
    }
  }

  const sublangidsArr = sublangidsRaw
    ? sublangidsRaw.split(',').filter((id) => id !== '')
    : DEFAULT_SUB_LANGUAGE_IDS

  if (!subonRaw) {
    return {
      activeSubLangId: null,
      acceptedSubLangIds: sublangidsArr
    }
  }

  if (subonRaw === 'true' && sublangidsArr.length > 0) {
    return {
      activeSubLangId: sublangidsArr[0],
      acceptedSubLangIds: sublangidsArr
    }
  }

  const activeSubLangId = subonRaw
  const acceptedSubLangIds = sublangidsArr.includes(activeSubLangId)
    ? sublangidsArr
    : [activeSubLangId, ...sublangidsArr]

  return { activeSubLangId, acceptedSubLangIds }
}

export default async function Page(props: {
  searchParams: Promise<{
    refId?: string
    start?: string
    end?: string
    subon?: string
    sublangids?: string
  }>
}) {
  const searchParams = await props.searchParams
  if (!searchParams.refId) {
    notFound()
  }

  const startTime = searchParams.start ? Number(searchParams.start) : undefined
  const endTime = searchParams.end ? Number(searchParams.end) : undefined
  const subonRaw = searchParams.subon ?? null
  const sublangidsRaw = searchParams.sublangids ?? null

  if (startTime != null && (isNaN(startTime) || startTime < 0)) {
    notFound()
  }

  if (endTime != null && (isNaN(endTime) || endTime < 0)) {
    notFound()
  }

  if (startTime != null && endTime != null && endTime <= startTime) {
    notFound()
  }

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: {
      id: searchParams.refId
    }
  })

  const videoVariant = data?.videoVariant
  if (!videoVariant?.hls || !videoVariant.videoId) {
    notFound()
  }

  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: videoVariant.videoId }
  })

  const { activeSubLangId, acceptedSubLangIds } = handleSubtitles(
    subonRaw,
    sublangidsRaw
  )

  const hlsUrl = videoVariant.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
  const subtitles = videoVariant.subtitle
    ?.filter((subtitle) =>
      acceptedSubLangIds.includes(subtitle.language?.id ?? '')
    )
    .map((subtitle) => ({
      key: subtitle.id,
      language: subtitle.language?.name?.[0]?.value,
      bcp47: subtitle.language?.bcp47,
      vttSrc: subtitle.vttSrc,
      langId: subtitle.language?.id ?? '',
      default: activeSubLangId === subtitle.language?.id
    }))

  return (
    <VideoPlayer
      hlsUrl={hlsUrl}
      videoTitle={videoTitle}
      thumbnail={thumbnail}
      startTime={startTime}
      endTime={endTime}
      subtitles={subtitles}
    />
  )
}
