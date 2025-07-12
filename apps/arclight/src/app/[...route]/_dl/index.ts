import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../lib/apolloClient'
import { setCorsHeaders } from '../../../lib/redirectUtils'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      variant(languageId: $languageId) {
        hls
        dash
        share
        downloads {
          quality
          url
        }
      }
    }
  }
`)

export const dl = new OpenAPIHono()

dl.openapi(
  createRoute({
    method: 'get',
    path: '/:mediaComponentId/:languageId',
    tags: ['Redirects by-convention'],
    summary: 'Redirects to the smallest/lowest quality download rendition',
    description:
      'Redirects to the smallest/lowest quality download rendition of the given media component and language IDs.',
    request: {
      params: z.object({
        mediaComponentId: z.string().describe('The ID of the media component'),
        languageId: z.string().describe('The ID of the language')
      })
    },
    responses: {
      302: {
        description: 'Redirects to the download URL'
      },
      404: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        },
        description: 'Download URL not found'
      },
      500: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string()
            })
          }
        },
        description: 'Internal server error'
      }
    }
  } as const),
  async (c) => {
    setCorsHeaders(c)
    const { mediaComponentId, languageId } = c.req.param()
    try {
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_VIDEO_VARIANT>
      >({
        query: GET_VIDEO_VARIANT,
        variables: {
          id: mediaComponentId,
          languageId
        }
      })
      if (!data.video?.variant) {
        return c.json({ error: 'Video variant not found' }, 404)
      }
      const variant = data.video.variant
      const download = variant.downloads?.find((d) => d.quality === 'low')
      if (!download?.url) {
        return c.json({ error: 'Low quality download URL not available' }, 404)
      }
      return c.redirect(download.url, 302)
    } catch (error) {
      if (error instanceof HTTPException) {
        if (error.status === 404) {
          return c.json({ error: error.message }, 404)
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
    }
  }
)
