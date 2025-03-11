import { OpenAPIHono } from '@hono/zod-openapi'
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

const getVideoVariant = async (
  mediaComponentId: string,
  languageId: string
) => {
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

app.get('/hls/:mediaComponentId/:languageId', async (c) => {
  const { mediaComponentId, languageId } = c.req.param()

  try {
    const variant = await getVideoVariant(mediaComponentId, languageId)
    if (!variant.hls) {
      return c.json({ error: 'HLS URL not available' }, 404)
    }
    return c.redirect(variant.hls)
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/dl/:mediaComponentId/:languageId', async (c) => {
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
      return c.json({ error: error.message }, error.status)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/dh/:mediaComponentId/:languageId', async (c) => {
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
      return c.json({ error: error.message }, error.status)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/s/:mediaComponentId/:languageId', async (c) => {
  const { mediaComponentId, languageId } = c.req.param()

  try {
    return c.redirect(
      `http://jesusfilm.org/bin/jf/watch.html/${mediaComponentId}/${languageId}`
    )
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
