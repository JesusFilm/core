//currently just an extended object used in videoblock

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { graphql } from '@core/shared/gql'

import { builder } from '../builder'
import { Language } from '../language'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'

interface YoutubeShape {
  id: string
}

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

// Create Apollo client for GraphQL operations
const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': 'api-media',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}

builder.queryFields((t) => ({
  getYouTubeClosedCaptionLanguageIds: t.field({
    type: [Language],
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_root, { videoId }) => {
      // Validate FIREBASE_API_KEY is present and non-empty
      const apiKey = process.env.FIREBASE_API_KEY
      if (!apiKey || apiKey.trim() === '') {
        throw new GraphQLError('YouTube API key is not configured', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }

      const query = new URLSearchParams({
        part: 'snippet',
        key: apiKey,
        videoId: videoId
      }).toString()

      let response
      try {
        response = await axios.get(
          `https://www.googleapis.com/youtube/v3/captions?${query}`
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
            throw new GraphQLError(
              'YouTube API quota exceeded. Please try again later.',
              {
                extensions: { code: 'QUOTA_EXCEEDED' }
              }
            )
          }
        }
        throw new GraphQLError(
          'Failed to fetch YouTube closed caption language IDs',
          {
            extensions: { code: 'EXTERNAL_SERVICE_ERROR' }
          }
        )
      }

      const youtubeLanguageBcp47s: string[] = []

      response.data.items.forEach(
        (item: {
          snippet: { language: string; trackKind: 'standard' | 'asr' }
        }) => {
          if (item?.snippet?.trackKind === 'standard')
            youtubeLanguageBcp47s.push(item.snippet.language)
        }
      )

      if (youtubeLanguageBcp47s.length === 0) return []

      const apollo = createApolloClient()

      let data
      try {
        const result = await apollo.query({
          query: GET_LANGUAGES_BY_BCP47,
          variables: {
            where: {
              bcp47: youtubeLanguageBcp47s
            }
          }
        })
        data = result.data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        throw new GraphQLError('Failed to fetch languages from gateway', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }

      return data.languages.map((language) => ({
        id: language.id
      }))
    }
  })
}))
