import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'
import { findDownloadWithFallback } from '../../lib/downloadHelpers'

import { GET_SHORT_LINK_QUERY } from './queries'

export const dynamic = 'force-dynamic'

const app = new OpenAPIHono().basePath('/')
app.use(etag())

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

type VideoVariant = {
  hls: string | null
  dash: string | null
  share: string | null
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

    // Check if video or variant doesn't exist
    if (!data.video?.variant) {
      throw new HTTPException(404, { message: 'Video variant not found' })
    }

    return data.video.variant
  } catch (error) {
    // Re-throw HTTPExceptions to preserve status codes
    if (error instanceof HTTPException) {
      throw error
    }
    // For any other error (including GraphQL errors for non-existent videos), return 404
    console.error('Error fetching video variant:', error)
    throw new HTTPException(404, { message: 'Video variant not found' })
  }
}

const setCorsHeaders = (c: any) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
  c.header('Access-Control-Expose-Headers', '*')
}

const DownloadQuerySchema = z.object({
  apiKey: z.string().optional().describe('API key for authentication')
})

const hlsRoute = createRoute({
  method: 'get',
  path: '/hls/:mediaComponentId/:languageId',
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
    200: {
      content: {
        'application/json': {
          schema: z.object({
            url: z.string().describe('The HLS video URL')
          })
        }
      },
      description: 'Returns the HLS video URL'
    },
    302: {
      description:
        'Redirects to the HLS stream URL. Note: The handler currently returns 200 with JSON, this documents intended redirect behavior for HLS manifest/playlist.'
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

const lowQualityRoute = createRoute({
  method: 'get',
  path: '/dl/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the smallest/lowest quality download rendition',
  description:
    'Redirects to the smallest/lowest quality download rendition of the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    }),
    query: DownloadQuerySchema
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

const highQualityRoute = createRoute({
  method: 'get',
  path: '/dh/:mediaComponentId/:languageId',
  tags: ['Redirects by-convention'],
  summary: 'Redirects to the largest/highest quality download rendition',
  description:
    'Redirects to the largest/highest quality download rendition of the given media component and language IDs.',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    }),
    query: DownloadQuerySchema
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

const watchRoute = createRoute({
  method: 'get',
  path: '/s/:mediaComponentId/:languageId',
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

app.doc('/redirects-doc.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Arclight API (Redirects)'
  }
})

app.get('/api/redirects-doc', swaggerUI({ url: '/redirects-doc.json' }))

// Register specific routes first before the generic keyword route
app.openapi(hlsRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    if (!variant.hls) {
      return c.json({ error: 'HLS URL not available' }, 404)
    }

    const response = await fetch(variant.hls, {
      redirect: 'follow',
      headers: {
        Origin: c.req.header('origin') || '*',
        Referer: c.req.header('referer') || '*'
      }
    })

    const finalUrl = response.url

    return c.redirect(finalUrl, 302)
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

app.openapi(lowQualityRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const apiKey = c.req.query('apiKey')

  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const download = findDownloadWithFallback(variant.downloads, 'low', apiKey)

    if (!download?.url) {
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

app.openapi(highQualityRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  const apiKey = c.req.query('apiKey')

  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const download = findDownloadWithFallback(variant.downloads, 'high', apiKey)

    if (!download?.url) {
      return c.json({ error: 'High quality download URL not available' }, 404)
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

app.openapi(watchRoute, async (c) => {
  setCorsHeaders(c)
  const { mediaComponentId, languageId } = c.req.param()
  try {
    return c.redirect(
      `https://jesusfilm.org/bin/jf/watch.html/${mediaComponentId}/${languageId}`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

// Register the generic keyword route LAST so it doesn't match specific routes
app.openapi(keywordRoute, async (c) => {
  setCorsHeaders(c)
  const { keyword } = c.req.param()

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
      console.error('GraphQL error fetching short link:', error ?? errors)
      throw new HTTPException(500, {
        message: 'Failed to query short link data'
      })
    }

    if (
      data?.shortLink?.__typename === 'QueryShortLinkByPathSuccess' &&
      data.shortLink.data.to
    ) {
      return c.redirect(data.shortLink.data.to, 302)
    } else {
      // Handle cases where shortLink is not found or typename is not success
      return c.json({ error: 'Keyword not found or invalid' }, 404)
    }
  } catch (err) {
    // Catch errors from Apollo client query or HTTPException
    if (err instanceof HTTPException) {
      throw err // Re-throw HTTPException to be handled by Hono's error handler
    }
    console.error('Error resolving keyword redirect:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

app.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})

export const GET = handle(app)
export const OPTIONS = handle(app)
