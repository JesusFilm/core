import { graphql } from 'gql.tada'
import { z } from 'zod'

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

const VideoPlayerUrlSchema = z
  .object({
    refId: z.string(),
    start: z
      .string()
      .optional()
      .transform((val) => {
        const num = val ? Number(val) : undefined
        return num != null && num >= 0 ? num : undefined
      }),
    end: z
      .string()
      .optional()
      .transform((val) => {
        const num = val ? Number(val) : undefined
        return num != null && num >= 0 ? num : undefined
      }),
    subon: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    sublangids: z.string().optional()
  })
  .transform((data) => {
    // If both start and end are defined, ensure start is before end
    if (data.start != null && data.end != null && data.start >= data.end) {
      return {
        ...data,
        start: undefined,
        end: undefined
      }
    }
    return data
  })

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[360px] w-full">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {message}
      </div>
    </div>
  )
}

export default async function Page({
  searchParams
}: {
  searchParams: {
    refId?: string
    start?: string
    end?: string
    subon?: string
    sublangids?: string
  }
}) {
  // Validate search params
  const validationResult = VideoPlayerUrlSchema.safeParse(searchParams)

  if (!validationResult.success) {
    return <ErrorMessage message="Invalid video reference ID" />
  }

  const { refId, start, end, subon, sublangids } = validationResult.data

  if (!refId) {
    return <ErrorMessage message="Missing video reference ID" />
  }

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: {
      id: refId
    }
  })
  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariant?.videoId ?? '' }
  })

  const acceptedSubLangIds = DEFAULT_SUB_LANGUAGE_IDS.concat(
    sublangids?.split(',') ?? []
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
      vttSrc: subtitle.vttSrc
    }))

  if (!hlsUrl) {
    return <ErrorMessage message={`No video URL found for ID: ${refId}`} />
  }

  return (
    <div className="w-full h-full min-h-[360px]">
      <VideoPlayer
        hlsUrl={hlsUrl}
        videoTitle={videoTitle}
        thumbnail={thumbnail}
        startTime={start}
        endTime={end}
        subon={subon}
        subtitles={subtitles}
      />
    </div>
  )
}
