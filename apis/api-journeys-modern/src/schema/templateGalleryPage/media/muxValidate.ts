import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { GraphQLError } from 'graphql'

import { graphql } from '@core/shared/gql'

import { env } from '../../../env'

const GET_MUX_VIDEO_QUERY = graphql(`
  query MuxVideoForEmbed($id: ID!) {
    getMuxVideo(id: $id) {
      id
      playbackId
    }
  }
`)

/**
 * Validates a Mux video for attachment to a TemplateGalleryPage and returns the
 * fields denormalized onto `TemplateGalleryPageMedia`.
 *
 * Reads Mux through the gateway (Apollo → `getMuxVideo`), matching exactly how
 * videos are added elsewhere (`block/video/service.ts` `fetchFieldsFromMux`):
 * no direct cross-DB Prisma client, and no ownership / team-membership check —
 * any authenticated team member may attach any Mux video that exists and is
 * ready. A present `playbackId` is the readiness signal (an upload still
 * processing has none); it is captured here so public-page reads never have to
 * cross back to the media subgraph.
 */
export async function muxValidate(
  muxVideoId: string
): Promise<{ muxVideoId: string; muxPlaybackId: string }> {
  const apollo = new ApolloClient({
    link: createHttpLink({
      uri: env.GATEWAY_URL,
      headers: {
        'x-graphql-client-name': 'api-journeys-modern',
        'x-graphql-client-version': env.SERVICE_VERSION
      }
    }),
    cache: new InMemoryCache()
  })

  const { data } = await apollo.query({
    query: GET_MUX_VIDEO_QUERY,
    variables: { id: muxVideoId }
  })

  if (data.getMuxVideo == null) {
    throw new GraphQLError('Mux video not found.', {
      extensions: { code: 'NOT_FOUND', reason: 'MUX_NOT_FOUND' }
    })
  }
  if (data.getMuxVideo.playbackId == null) {
    // No playbackId means the upload has not finished processing — not ready
    // to embed yet. Mirrors fetchFieldsFromMux treating playbackId as the
    // readiness signal.
    throw new GraphQLError('Mux video is not ready to embed yet.', {
      extensions: { code: 'BAD_USER_INPUT', reason: 'MUX_NOT_READY' }
    })
  }

  return { muxVideoId, muxPlaybackId: data.getMuxVideo.playbackId }
}
