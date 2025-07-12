import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../lib/apolloClient'
import { setCorsHeaders } from '../../../lib/redirectUtils'

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
    const { data } = await getApolloClient().query<ResultOf<typeof GET_VIDEO_VARIANT>>({
      query: GET_VIDEO_VARIANT,
      variables: {
        id: mediaComponentId,
        languageId
      }
    })
    if (!data.video?.variant) {
      throw new HTTPException(404, { message: 'Video variant not found' })
    }
    const variant = data.video.variant
    const download = variant.downloads?.find(d => d.quality === 'low')
    if (!download?.url) {
      return c.json({ error: 'Low quality download URL not available' }, 404)
    }
    return c.redirect(download.url, 302)
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
