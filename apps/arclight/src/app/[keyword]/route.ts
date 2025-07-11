import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'
import {
  BrightcoveSourceCode,
  getBrightcoveVideo,
  selectBrightcoveSource
} from '../../lib/brightcove'
import { GET_SHORT_LINK_QUERY } from '../[...route]/queries'
import { getClientIp, setCorsHeaders } from '../_redirectUtils'

const app = new OpenAPIHono().basePath('/')

const keywordRoute = createRoute({
  method: 'get',
  path: '/:keyword',
  tags: ['Redirect keyword'],
  summary: 'Redirects a short URL keyword',
  description: 'Returns a short URL keyword to its corresponding long URL.',
  request: {
    params: z.object({
      keyword: z
        .string()
        .regex(
          /^[A-Za-z0-9_-]+$/,
          'Keyword must contain only letters, numbers, dashes or underscores'
        )
        .min(3, 'Keyword must be at least 3 characters')
        .max(32, 'Keyword cannot exceed 32 characters')
        .describe('The short URL keyword')
    })
  },
  responses: {
    302: {
      description: 'Redirects to the long URL'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Keyword not found'
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

app.openapi(keywordRoute, async (c) => {
  setCorsHeaders(c)
  const { keyword } = c.req.param()
  const clientIp = getClientIp(c)
  try {
    const { data, error, errors } = await getApolloClient().query<
      ResultOf<typeof GET_SHORT_LINK_QUERY>
    >({
      query: GET_SHORT_LINK_QUERY,
      variables: {
        hostname: 'arc.gt',
        pathname: keyword
      }
    })

    if (error != null || errors != null) {
      throw new HTTPException(500, {
        message: 'Failed to query short link data'
      })
    }

    if (data?.shortLink?.__typename === 'QueryShortLinkByPathSuccess') {
      const { to, brightcoveId, redirectType } = data.shortLink.data
      if (
        redirectType &&
        brightcoveId &&
        typeof redirectType === 'string' &&
        typeof brightcoveId === 'string'
      ) {
        try {
          const video = await getBrightcoveVideo(brightcoveId, false, clientIp)
          const src = selectBrightcoveSource(
            video,
            redirectType as BrightcoveSourceCode
          )
          if (src) {
            return c.redirect(src, 302)
          }
        } catch (err) {
          console.error('Error getting brightcove video', err)
        }
      }
      if (to && typeof to === 'string') {
        return c.redirect(to, 302)
      }
    }
    return c.json({ error: 'Keyword not found or invalid' }, 404)
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    const errorMessage = err instanceof Error ? err.message : String(err)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

app.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})

export const GET = handle(app)
