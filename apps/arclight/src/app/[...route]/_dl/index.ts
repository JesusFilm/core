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
        const url = await getBrightcoveRedirectUrl(brightcoveId, 'dl')
        return c.redirect(url, 302)
      } catch (err) {
        // Fallback to variant.downloads below
      }
    }
    const downloads = data.video?.variant?.downloads
    const low = downloads?.find(
      (d: { quality?: string; url?: string }) => d.quality === 'low'
    )
    if (low?.url) {
      return c.redirect(low.url, 302)
    }
    return c.json({ error: 'Video or low quality download not found' }, 404)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

dl.options('*', (c: Context) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})
