import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'

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

    if (!data.video?.variant) {
      throw new HTTPException(404, { message: 'Video variant not found' })
    }

    return data.video.variant
  } catch (error) {
    console.error('Error fetching video variant:', error)
    throw new HTTPException(500, { message: 'Failed to fetch video data' })
  }
}

const hlsRoute = createRoute({
  method: 'get',
  path: '/hls/:mediaComponentId/:languageId',
  tags: ['Video Player'],
  summary: 'Get HLS video URL',
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

const downloadRoute = createRoute({
  method: 'get',
  path: '/dl/:mediaComponentId/:languageId',
  tags: ['Video Player'],
  summary: 'Get video download URL',
  request: {
    params: z.object({
      mediaComponentId: z.string().describe('The ID of the media component'),
      languageId: z.string().describe('The ID of the language')
    }),
    query: z.object({
      quality: z
        .string()
        .optional()
        .describe('The desired video quality (defaults to "high")')
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

const highQualityRoute = createRoute({
  method: 'get',
  path: '/dh/:mediaComponentId/:languageId',
  tags: ['Video Player'],
  summary: 'Get high-quality video download URL',
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

const watchRoute = createRoute({
  method: 'get',
  path: '/s/:mediaComponentId/:languageId',
  tags: ['Video Player'],
  summary: 'Redirect to watch page',
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

app.openapi(hlsRoute, async (c) => {
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

    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    c.header('Access-Control-Allow-Headers', '*')
    c.header('Access-Control-Expose-Headers', '*')

    return c.json({ url: finalUrl }, 200)
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

app.openapi(downloadRoute, async (c) => {
  const { mediaComponentId, languageId } = c.req.param()
  const quality = c.req.query('quality') || 'high'
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const download = variant.downloads?.find((d) => d.quality === quality)

    if (!download?.url) {
      return c.json(
        { error: `Download URL for quality '${quality}' not available` },
        404
      )
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
  const { mediaComponentId, languageId } = c.req.param()
  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    const download = variant.downloads?.find((d) => d.quality === 'high')

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
  const { mediaComponentId, languageId } = c.req.param()
  try {
    return c.redirect(
      `http://jesusfilm.org/bin/jf/watch.html/${mediaComponentId}/${languageId}`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return c.json({ error: `Internal server error: ${errorMessage}` }, 500)
  }
})

app.options('*', (c) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
  return new Response(null, { status: 204 })
})

export const GET = handle(app)
