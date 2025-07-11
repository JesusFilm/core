import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'
import {
  getBrightcoveVideo,
  selectBrightcoveSource
} from '../../lib/brightcove'
import { getClientIp, setCorsHeaders } from '../_redirectUtils'

const app = new OpenAPIHono().basePath('/s')

const sRoute = createRoute({
  method: 'get',
  path: '/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the target share URL',
  description:
    'Redirects to the target share URL of the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    })
  },
  responses: {
    302: {
      description: 'Redirects to the watch page'
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

const GET_VIDEO_VARIANT = /* GraphQL */ `
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      variant(languageId: $languageId) {
        hls
        dash
        share
        brightcoveId
        downloads {
          quality
          url
        }
      }
    }
  }
`

const getVideoVariant = async (
  mediaComponentId: string,
  languageId: string
) => {
  try {
    const { data } = await getApolloClient().query({
      query: GET_VIDEO_VARIANT,
      variables: {
        id: mediaComponentId,
        languageId
      }
    })
    if (!data.video?.variant) {
      throw new HTTPException(404, { message: 'Video variant not found' })
    }
    return data.video.variant
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch video data' })
  }
}

app.openapi(sRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const clientIp = getClientIp(c)
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    if (variant.share) {
      return c.redirect(variant.share, 302)
    }
    const brightcoveId = variant.brightcoveId ?? null
    if (brightcoveId) {
      try {
        const video = await getBrightcoveVideo(brightcoveId, false, clientIp)
        const src = selectBrightcoveSource(video, 's')
        if (src) return c.redirect(src, 302)
      } catch (err) {}
    }
    // Fallback to legacy watch page if all else fails
    return c.redirect(
      `https://jesusfilm.org/bin/jf/watch.html/${mediaComponentId}/${languageId}`,
      302
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

app.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})

export const GET = handle(app)
