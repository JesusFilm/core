import { graphql } from '@core/shared/gql'

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
    return {
      message: 'Missing refId parameter',
      status: 404
    }
  }

  // Parse start and end times, ensuring they are valid numbers
  const startTime = searchParams.start ? Number(searchParams.start) : undefined
  const endTime = searchParams.end ? Number(searchParams.end) : undefined
  const subonRaw = searchParams.subon ?? null
  const sublangidsRaw = searchParams.sublangids ?? null

  // Validate time parameters
  if (startTime != null && (isNaN(startTime) || startTime < 0)) {
    return {
      message: 'Invalid start time parameter',
      status: 400
    }
  }

  if (endTime != null && (isNaN(endTime) || endTime < 0)) {
    return {
      message: 'Invalid end time parameter',
      status: 400
    }
  }

  if (startTime != null && endTime != null && endTime <= startTime) {
    return {
      message: 'End time must be greater than start time',
      status: 400
    }
  }

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: {
      id: searchParams.refId
    }
  })
  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariant?.videoId ?? '' }
  })

  const { activeSubLangId, acceptedSubLangIds } = handleSubtitles(
    subonRaw,
    sublangidsRaw
  )

  const hlsUrl = data?.videoVariant?.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
  const subtitles = data?.videoVariant?.subtitle
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

  if (!hlsUrl) {
    return {
      message: 'No video URL found for ID: ' + searchParams.refId,
      status: 404
    }
  }

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
