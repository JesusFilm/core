//currently just an extended object used in videoblock

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import axios, { isAxiosError } from 'axios'
import { GraphQLError } from 'graphql'

import { ResultOf, graphql } from '@core/shared/gql'

import { builder } from '../builder'
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
      bcp47
      name {
        value
        primary
      }
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

const YouTubeLanguageName = builder.objectRef<{
  value: string
  primary: boolean
}>('YouTubeLanguageName')
YouTubeLanguageName.implement({
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary')
  })
})

const YouTubeLanguage =
  builder.objectRef<ResultOf<typeof GET_LANGUAGES_BY_BCP47>['languages'][0]>(
    'YouTubeLanguage'
  )
YouTubeLanguage.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    bcp47: t.exposeString('bcp47', { nullable: true }),
    name: t.expose('name', {
      type: [YouTubeLanguageName]
    })
  })
})

builder.queryFields((t) => ({
  getYouTubeClosedCaptionLanguageIds: t.field({
    type: [YouTubeLanguage],
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_root, { videoId }) => {
      const query = new URLSearchParams({
        part: 'snippet',
        key: process.env.FIREBASE_API_KEY ?? '',
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
              return [
                {
                  id: '529',
                  bcp47: 'en',
                  name: [
                    {
                      value: 'English',
                      primary: true
                    }
                  ]
                }
              ]
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
      } catch (error) {
        throw new GraphQLError('Failed to fetch languages from gateway', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }

      return data.languages
    }
  })
}))
