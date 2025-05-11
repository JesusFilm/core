import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'

import { mediaComponentLinksWithId } from './[mediaComponentId]'

const GET_VIDEOS_CHILDREN = graphql(`
  query GetVideosChildren(
    $ids: [ID!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $limit: Int
  ) {
    videos(where: { ids: $ids }, limit: $limit) {
      id
      children {
        id
      }
      parents {
        id
      }
      title(languageId: $metadataLanguageId) {
        value
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
    }
  }
`)

const QuerySchema = z.object({
  ids: z.string().optional(),
  metadataLanguageTags: z.string().optional()
})

const ResponseSchema = z.object({
  _links: z.object({
    self: z.object({
      href: z.string()
    })
  }),
  _embedded: z.object({
    mediaComponentsLinks: z.array(
      z.object({
        mediaComponentId: z.string(),
        linkedMediaComponentIds: z.object({
          contains: z.array(z.string()).optional(),
          containedBy: z.array(z.string()).optional()
        })
      })
    )
  })
})

export const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Components'],
  summary: 'Get media component links',
  description: 'Get media component links',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media component links'
    }
  }
})

export const mediaComponentLinks = new OpenAPIHono()
mediaComponentLinks.route('/:mediaComponentId', mediaComponentLinksWithId)

mediaComponentLinks.openapi(route, async (c) => {
  const ids = c.req.query('ids')?.split(',').filter(Boolean) ?? undefined
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []
  const queryObject = c.req.query()

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const cacheKey = generateCacheKey([
    'media-component-links',
    ...(ids ?? []).slice(0, 20),
    ...metadataLanguageTags.slice(0, 20)
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    try {
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_VIDEOS_CHILDREN>
      >({
        query: GET_VIDEOS_CHILDREN,
        variables: {
          ids,
          metadataLanguageId,
          fallbackLanguageId,
          limit: 10000
        }
      })

      const mediaComponentsLinks = data.videos
        .filter(
          (video) => video.children.length > 0 || video.parents.length > 0
        )
        .filter(
          (video) =>
            video.title[0]?.value != null ||
            video.fallbackTitle[0]?.value != null
        )
        .map((video) => ({
          mediaComponentId: video.id,
          linkedMediaComponentIds: {
            ...(video.children.length > 0
              ? { contains: video.children.map(({ id }) => id) }
              : {}),
            ...(video.parents.length > 0
              ? { containedBy: video.parents.map(({ id }) => id) }
              : {})
          }
        }))

      const queryString = new URLSearchParams(queryObject).toString()
      return {
        _links: {
          self: {
            href: `http://api.arclight.org/v2/mediaComponents?${queryString}`
          }
        },
        _embedded: {
          mediaComponentsLinks
        }
      }
    } catch (err) {
      throw new HTTPException(500, {
        message: `Failed to get videos with children: ${err instanceof Error ? err.message : String(err)}`
      })
    }
  })

  return c.json(response)
})
