import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'
import {
  getBrightcoveVideo,
  selectBrightcoveSource
} from '../../lib/brightcove'
import { getClientIp, setCorsHeaders } from '../_redirectUtils'

const app = new OpenAPIHono().basePath('/dl')

const dlRoute = createRoute({
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

app.openapi(dlRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const clientIp = getClientIp(c)
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const download = variant.downloads?.find((d: any) => d.quality === 'low')
    if (!download?.url) {
      const brightcoveId = variant.brightcoveId ?? null
      if (brightcoveId) {
        try {
          const video = await getBrightcoveVideo(brightcoveId, false, clientIp)
          const src = selectBrightcoveSource(video, 'dl')
          if (src) {
            return c.redirect(src, 302)
          }
        } catch (err) {}
      }
      return c.json({ error: 'Low quality download URL not available' }, 404)
    }
    return c.redirect(download.url)
  } catch (error) {
    if (error instanceof HTTPException) {
      if (error.status === 404) {
        return c.json({ error: error.message }, 404)
      }
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

app.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})

export const GET = handle(app)
