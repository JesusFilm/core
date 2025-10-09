import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import tracer from 'dd-trace'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../lib/apolloClient'
import { getBrightcoveUrl } from '../../lib/brightcove'
import { getClientIp, setCorsHeaders } from '../../lib/redirectUtils'

export const GET_SHORT_LINK_QUERY = graphql(`
  query GetShortLinkQuery($hostname: String!, $pathname: String!) {
    shortLink: shortLinkByPath(hostname: $hostname, pathname: $pathname) {
      __typename
      ... on QueryShortLinkByPathSuccess {
        data {
          to
          redirectType
          brightcoveId
          bitrate
        }
      }
    }
  }
`)

const app = new OpenAPIHono().basePath('/')

// Add Datadog tracing middleware
app.use('*', async (c, next) => {
  const span = tracer.startSpan('arclight.keyword.request', {
    tags: {
      'http.method': c.req.method,
      'http.url': c.req.url,
      'service.name': 'arclight-keyword'
    }
  })

  // Log request details
  console.log(
    JSON.stringify({
      level: 'info',
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header('user-agent'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      msg: 'Keyword request received',
      testCorrelation:
        'This log should have dd.trace_id and dd.span_id added automatically'
    })
  )

  try {
    await next()
    span.setTag('http.status_code', c.res.status)

    // Log successful response
    console.log(
      JSON.stringify({
        level: 'info',
        method: c.req.method,
        url: c.req.url,
        statusCode: c.res.status,
        msg: 'Keyword request completed'
      })
    )

    span.finish()
  } catch (error) {
    span.setTag('error', true)
    span.setTag(
      'error.message',
      error instanceof Error ? error.message : String(error)
    )

    // Log error with stack trace
    console.log(
      JSON.stringify({
        level: 'error',
        method: c.req.method,
        url: c.req.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        msg: 'Keyword request failed'
      })
    )

    span.finish()
    throw error
  }
})

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
    const hostname =
      process.env.SERVICE_ENV === 'stage' ? 'stg.arc.gt' : 'arc.gt'

    const { data, error, errors } = await getApolloClient().query<
      ResultOf<typeof GET_SHORT_LINK_QUERY>
    >({
      query: GET_SHORT_LINK_QUERY,
      variables: {
        hostname,
        pathname: keyword
      }
    })

    if (error != null || errors != null) {
      throw new HTTPException(500, {
        message: 'Failed to query short link data'
      })
    }

    if (data?.shortLink?.__typename === 'QueryShortLinkByPathSuccess') {
      const { to, brightcoveId, redirectType, bitrate } = data.shortLink.data

      if (
        redirectType &&
        brightcoveId &&
        typeof redirectType === 'string' &&
        typeof brightcoveId === 'string'
      ) {
        try {
          const url = await getBrightcoveUrl(
            brightcoveId,
            redirectType,
            bitrate,
            clientIp
          )
          return c.redirect(url, 302)
        } catch (err) {
          console.error(
            '[Redirect] Brightcove error for keyword:',
            keyword,
            err
          )
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
