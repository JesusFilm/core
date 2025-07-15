import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../lib/apolloClient'
import { getBrightcoveRedirectUrl } from '../../../lib/brightcove'
import { setCorsHeaders } from '../../../lib/redirectUtils'
import { findDownloadWithFallback } from '../../../lib/downloadHelpers'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      variant(languageId: $languageId) {
        brightcoveId
        downloads {
          quality
          url
        }
      }
    }
  }
`)

type VideoVariant = {
  brightcoveId?: string | null
  downloads: Array<{
    quality: string
    url: string
  }> | null
}

const getVideoVariant = async (
  mediaComponentId: string,
  languageId: string
): Promise<VideoVariant> => {
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
      throw new HTTPException(404, { message: 'Video variant not found' })
    }
    return data.video.variant
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    throw new HTTPException(404, { message: 'Video variant not found' })
  }
}

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

export const dl = new OpenAPIHono()

dl.openapi(dlRoute, async (c: Context) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const apiKey = c.req.query('apiKey')
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const brightcoveId = variant.brightcoveId
    if (brightcoveId) {
      try {
        const url = await getBrightcoveRedirectUrl(brightcoveId, 'dl')
        return c.redirect(url)
      } catch (err) {
        console.warn('Brightcove redirect failed, falling back to variant downloads:', err)
        // Fallback to variant downloads below
      }
    }
    const download = findDownloadWithFallback(variant.downloads, 'low', apiKey)
    if (!download?.url) {
      return c.json({ error: 'Low quality download URL not available' }, 404)
    }
    return c.redirect(download.url)
  } catch (error) {
    if (error instanceof HTTPException && error.status === 404) {
      return c.json({ error: error.message }, 404)
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

dl.options('*', (c: Context) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})
