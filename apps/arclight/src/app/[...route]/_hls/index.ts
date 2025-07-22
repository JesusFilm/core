import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../lib/apolloClient'
import { getBrightcoveRedirectUrl } from '../../../lib/brightcove'
import { setCorsHeaders } from '../../../lib/redirectUtils'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      variant(languageId: $languageId) {
        brightcoveId
        hls
      }
    }
  }
`)

const hlsRoute = createRoute({
  method: 'get',
  path: '/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the HTTP Live Streaming (HLS) rendition',
  description:
    'Redirects to the HTTP Live Streaming (HLS) rendition of the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    })
  },
  responses: {
    302: {
      description: 'Redirects to the HLS stream URL'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Video variant or HLS URL not found'
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
} as const)

export const hls = new OpenAPIHono()

hls.openapi(hlsRoute, async (c: Context) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const clientIp =
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || ''

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
    const brightcoveId = data.video?.variant?.brightcoveId
    if (brightcoveId) {
      try {
        const url = await getBrightcoveRedirectUrl(
          brightcoveId,
          'hls',
          clientIp
        )
        return c.redirect(url, 302)
      } catch (err) {
        console.warn(
          'Brightcove redirect failed, falling back to variant HLS:',
          err
        )
      }
    }
    const hlsUrl = data.video?.variant?.hls
    if (hlsUrl) {
      return c.redirect(hlsUrl, 302)
    }
    return c.json({ error: 'Video or HLS URL not found' }, 404)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

hls.options('*', (c: Context) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})
