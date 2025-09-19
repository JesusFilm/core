import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { graphql } from '@core/shared/gql'

export const videoBlockYouTubeSchema = z.object({
  videoId: z
    .string({ required_error: 'videoId is required' })
    .regex(/^[-\w]{11}$/, 'videoId must be a valid YouTube videoId')
})

export const videoBlockInternalSchema = z.object({
  videoId: z.string().nullish(),
  videoVariantLanguageId: z.string().nullish()
})

export const videoBlockMuxSchema = z.object({
  videoId: z
    .string({ required_error: 'videoId is required for mux source' })
    .min(1)
})

export interface YoutubeVideosData {
  items: Array<{
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: { high: { url: string } }
    }
    contentDetails: {
      duration: string
    }
  }>
}

const GET_MUX_VIDEO_QUERY = graphql(`
  query GetMuxVideo($id: ID!) {
    getMuxVideo(id: $id) {
      id
      name
      playbackId
      duration
    }
  }
`)

export async function fetchFieldsFromMux(videoId: string): Promise<
  | {
      title: string | null
    }
  | {
      title: string | null
      image: string
      duration: number
      endAt: number
    }
> {
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'api-journeys',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })
  const apollo = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })

  const { data } = await apollo.query({
    query: GET_MUX_VIDEO_QUERY,
    variables: { id: videoId }
  })

  if (data.getMuxVideo == null) {
    throw new GraphQLError('videoId cannot be found on Mux', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  if (data.getMuxVideo.playbackId == null) {
    return {
      title: data.getMuxVideo.name
    }
  }
  return {
    title: data.getMuxVideo.name,
    image: `https://image.mux.com/${data.getMuxVideo.playbackId}/thumbnail.png?time=1`,
    duration: Math.round(data.getMuxVideo.duration ?? 0),
    endAt: Math.round(data.getMuxVideo.duration ?? 0)
  }
}

export async function fetchFieldsFromYouTube(videoId: string): Promise<{
  title: string
  description: string
  image: string
  duration: number
}> {
  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.FIREBASE_API_KEY ?? '',
    id: videoId
  }).toString()
  const videosData: YoutubeVideosData = await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${query}`)
  ).json()
  if (videosData.items[0] == null) {
    throw new GraphQLError('videoId cannot be found on YouTube', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  return {
    title: videosData.items[0].snippet.title,
    description: videosData.items[0].snippet.description,
    image: videosData.items[0].snippet.thumbnails.high.url,
    duration: parseISO8601Duration(videosData.items[0].contentDetails.duration)
  }
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/)

  if (match == null) {
    console.error(`Invalid duration: ${duration}`)
    return 0
  }
  const [years, weeks, days, hours, minutes, seconds] = match
    .slice(1)
    .map((period) =>
      period != null ? Number.parseInt(period.replace(/\D/, '')) : 0
    )
  return (
    (((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
    seconds
  )
}
