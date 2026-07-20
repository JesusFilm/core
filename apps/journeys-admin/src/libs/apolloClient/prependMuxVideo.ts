import { ApolloCache, Reference, gql } from '@apollo/client'

const NEW_MUX_VIDEO_FRAGMENT = gql`
  fragment NewMuxVideo on MuxVideo {
    id
    playbackId
    readyToStream
    duration
    userId
  }
`

/**
 * Prepend a newly-ready MuxVideo to the cached getMyMuxVideos list with dedup
 * by id. Mirrors prependCloudflareImage in the image-library — avoids the
 * refetch-stomp where offsetLimitPagination overwrites accumulated pages after
 * a paginated user has clicked Load More.
 */
export function prependMuxVideo(
  cache: ApolloCache<unknown>,
  video: {
    id: string
    playbackId: string
    readyToStream: boolean
    duration?: number | null
    userId: string
  }
): void {
  const ref = cache.writeFragment({
    data: {
      __typename: 'MuxVideo',
      ...video,
      duration: video.duration ?? null
    },
    fragment: NEW_MUX_VIDEO_FRAGMENT
  })
  if (ref == null) return
  cache.modify({
    fields: {
      getMyMuxVideos(existing, { readField }) {
        const list = Array.isArray(existing) ? (existing as Reference[]) : []
        const deduped = list.filter(
          (item) => readField<string>('id', item) !== video.id
        )
        return [ref, ...deduped]
      }
    }
  })
}
