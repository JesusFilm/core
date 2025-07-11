import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { getApolloClient } from '../../lib/apolloClient'
import {
  getBrightcoveVideo,
  selectBrightcoveSource
} from '../../lib/brightcove'

import { GET_SHORT_LINK_QUERY } from './queries'

export const dynamic = 'force-dynamic'

const app = new OpenAPIHono().basePath('/')
app.use(etag())

// Simple logging helper to keep messages consistent
const log = (...args: unknown[]) => console.log('[Redirects]', ...args)

log('Gateway URL', process.env.NEXT_PUBLIC_GATEWAY_URL)

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
    console.log('getVideoVariant', mediaComponentId, languageId)
    console.log('typeof mediaComponentId', typeof mediaComponentId)
    console.log('typeof languageId', typeof languageId)

    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_VIDEO_VARIANT>
    >({
      query: GET_VIDEO_VARIANT,
      variables: {
        id: mediaComponentId,
        languageId
      }
    })

    console.log('data', data)

    if (!data.video?.variant) {
      throw new HTTPException(404, { message: 'Video variant not found' })
    }

    return data.video.variant as unknown as VideoVariant
  } catch (error) {
    console.error(
      'Error fetching video variant:',
      JSON.stringify(error, null, 2)
    )
    throw new HTTPException(500, { message: 'Failed to fetch video data' })
  }
}

const setCorsHeaders = (c: any) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
  c.header('Access-Control-Expose-Headers', '*')
}

// Helper to get the client IP from Hono context
function getClientIp(c: any): string | undefined {
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = c.req.header('x-real-ip')
  if (realIp) {
    return realIp
  }
  // Fallback for direct connections (like localhost)
  return c.env?.remoteAddr?.address
}

// Remove all redirect route logic for hls, dl, dh, s, and keyword
// Only keep non-redirect logic (e.g., OpenAPI docs, unrelated routes)

app.doc('/redirects-doc.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Arclight API (Redirects)'
  }
})

app.get('/api/redirects-doc', swaggerUI({ url: '/redirects-doc.json' }))

// ... keep any other non-redirect routes here ...

app.options('*', (c) => {
  // Optionally keep CORS preflight for non-redirects
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
  c.header('Access-Control-Expose-Headers', '*')
  return c.body(null, 204)
})

export const GET = handle(app)
