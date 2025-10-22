//currently just an extended object used in videoblock

import axios, { isAxiosError } from 'axios'
import { ZodError, z } from 'zod'

import { graphql } from '@core/shared/gql'
import { createApolloClient } from '@core/yoga/apolloClient'

import { builder } from '../builder'
import { Language } from '../language'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'

interface YoutubeShape {
  id: string
}

const YouTubeCaptionsResponseSchema = z.object({
  items: z.array(
    z.object({
      snippet: z.object({
        language: z.string(),
        trackKind: z.enum(['standard', 'asr'])
      })
    })
  )
})

type YouTubeCaptionsResponse = z.infer<typeof YouTubeCaptionsResponseSchema>

const YouTube = builder.objectRef<YoutubeShape>('Youtube')
YouTube.implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    source: t.field({
      type: VideoSource,
      shareable: true,
      resolve: () => VideoSourceShape.mux
    }),
    primaryLanguageId: t.id({
      nullable: true,
      shareable: true,
      resolve: () => null
    })
  })
})

builder.asEntity(YouTube, {
  key: builder.selection<{ id: string; primaryLanguageId: string }>(
    'id primaryLanguageId'
  ),
  resolveReference: async ({ id }) => ({
    id,
    source: VideoSourceShape.youTube,
    primaryLanguageId: null
  })
})

const GET_LANGUAGES_BY_BCP47 = graphql(`
  query GetLanguagesByBCP47($where: LanguagesFilter) {
    languages(where: $where) {
      id
    }
  }
`)

builder.queryFields((t) => ({
  youtubeClosedCaptionLanguages: t.field({
    type: [Language],
    errors: {
      types: [Error, ZodError]
    },
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_root, { videoId }) => {
      // Validate FIREBASE_API_KEY is present and non-empty
      const apiKey = process.env.FIREBASE_API_KEY
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('YouTube API key is not configured')
      }

      const query = new URLSearchParams({
        part: 'snippet',
        videoId: videoId
      }).toString()

      let response
      try {
        response = await axios.get(
          `https://www.googleapis.com/youtube/v3/captions?${query}`,
          {
            headers: {
              'X-Goog-Api-Key': apiKey
            }
          }
        )
      } catch (error) {
        // Handle YouTube API quota exceeded error specifically
        // if in staging or dev, return mock data.
        if (isAxiosError(error) && error.response?.status === 403) {
          const errorData = error.response?.data
          if (errorData?.error?.errors?.[0]?.reason === 'quotaExceeded') {
            if (process.env.NODE_ENV !== 'production') {
              return [{ id: '529' }]
            }
            throw new Error(
              'YouTube API quota exceeded. Please try again later.'
            )
          }
        }
        throw new Error('Failed to fetch YouTube closed caption language IDs')
      }

      // Validate the response structure with Zod
      let ytClosedCaptionResponse: YouTubeCaptionsResponse
      try {
        ytClosedCaptionResponse = YouTubeCaptionsResponseSchema.parse(
          response.data
        )
      } catch {
        throw new Error('Invalid YouTube API response format')
      }

      const bcp47: string[] = []

      ytClosedCaptionResponse.items.forEach((item) => {
        if (item.snippet.trackKind === 'standard') {
          bcp47.push(item.snippet.language)
        }
      })

      if (bcp47.length === 0) return []

      const apollo = createApolloClient('api-media')

      let data
      try {
        const result = await apollo.query({
          query: GET_LANGUAGES_BY_BCP47,
          variables: {
            select: {
              id: true
            },
            where: {
              bcp47
            }
          }
        })
        data = result.data
      } catch {
        throw new Error('Failed to fetch languages from gateway')
      }

      return data.languages
    }
  })
}))
