import { InMemoryCache } from '@apollo/client'

import { GET_MY_MUX_VIDEOS } from './MyMuxVideos'
import { prependMuxVideo } from './prependMuxVideo'

const NEW_VIDEO = {
  id: 'new-video-id',
  playbackId: 'new-playback-id',
  readyToStream: true
}

function buildCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getMyMuxVideos: {
            keyArgs: false,
            merge(existing = [], incoming: unknown[]) {
              return [...existing, ...incoming]
            }
          }
        }
      }
    }
  })
}

function seedCache(
  cache: InMemoryCache,
  videos: Array<{
    __typename: 'MuxVideo'
    id: string
    playbackId: string
    readyToStream: boolean
    duration: number | null
  }>
): void {
  cache.writeQuery({
    query: GET_MY_MUX_VIDEOS,
    variables: { offset: 0, limit: 11 },
    data: { getMyMuxVideos: videos }
  })
}

function readVideos(
  cache: InMemoryCache
): Array<{ id: string; playbackId: string | null; readyToStream: boolean }> {
  const result = cache.readQuery<{
    getMyMuxVideos: Array<{
      id: string
      playbackId: string | null
      readyToStream: boolean
    }>
  }>({
    query: GET_MY_MUX_VIDEOS,
    variables: { offset: 0, limit: 11 }
  })
  return result?.getMyMuxVideos ?? []
}

describe('prependMuxVideo', () => {
  it('should prepend the new video to an empty list', () => {
    const cache = buildCache()
    seedCache(cache, [])

    prependMuxVideo(cache, NEW_VIDEO)

    expect(readVideos(cache)).toEqual([
      expect.objectContaining({ id: NEW_VIDEO.id })
    ])
  })

  it('should prepend the new video to the front of an existing list', () => {
    const cache = buildCache()
    seedCache(cache, [
      {
        __typename: 'MuxVideo',
        id: 'existing-1',
        playbackId: 'pb-1',
        readyToStream: true,
        duration: null
      },
      {
        __typename: 'MuxVideo',
        id: 'existing-2',
        playbackId: 'pb-2',
        readyToStream: true,
        duration: null
      }
    ])

    prependMuxVideo(cache, NEW_VIDEO)

    const ids = readVideos(cache).map((v) => v.id)
    expect(ids).toEqual([NEW_VIDEO.id, 'existing-1', 'existing-2'])
  })

  it('should dedup by id so a re-prepend of the same video does not duplicate', () => {
    const cache = buildCache()
    seedCache(cache, [
      {
        __typename: 'MuxVideo',
        id: NEW_VIDEO.id,
        playbackId: NEW_VIDEO.playbackId,
        readyToStream: NEW_VIDEO.readyToStream,
        duration: null
      },
      {
        __typename: 'MuxVideo',
        id: 'existing-1',
        playbackId: 'pb-1',
        readyToStream: true,
        duration: null
      }
    ])

    prependMuxVideo(cache, NEW_VIDEO)

    const ids = readVideos(cache).map((v) => v.id)
    expect(ids).toEqual([NEW_VIDEO.id, 'existing-1'])
  })
})
