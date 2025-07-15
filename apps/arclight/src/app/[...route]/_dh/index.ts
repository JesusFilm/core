import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import type { Context } from 'hono'

import { getApolloClient } from '../../../lib/apolloClient'
import { getBrightcoveRedirectUrl } from '../../../lib/brightcove'
import { setCorsHeaders } from '../../../lib/redirectUtils'

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

const dhRoute = createRoute({
  method: 'get',
  path: '/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the largest/highest quality download rendition',
  description:
    'Redirects to the largest/highest quality download rendition of the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    })
  },
  responses: {
    302: {
      description: 'Redirects to the high-quality download URL'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'High-quality download URL not found'
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

export const dh = new OpenAPIHono()

dh.openapi(dhRoute, async (c: Context) => {
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
    const brightcoveId = data.video?.variant?.brightcoveId
    if (brightcoveId) {
      try {
        const url = await getBrightcoveRedirectUrl(brightcoveId, 'dh')
        return c.redirect(url, 302)
      } catch (err) {
        // Fallback to variant.downloads below
      }
    }
    const downloads = data.video?.variant?.downloads
    const high = downloads?.find(
      (d: { quality?: string; url?: string }) => d.quality === 'high'
    )
    if (high?.url) {
      return c.redirect(high.url, 302)
    }
    return c.json({ error: 'Video or high quality download not found' }, 404)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

dh.options('*', (c: Context) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})
