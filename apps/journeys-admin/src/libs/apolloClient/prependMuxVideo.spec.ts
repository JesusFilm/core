import { InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'

import { GET_MY_MUX_VIDEOS } from '../../components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos'

import { prependMuxVideo } from './prependMuxVideo'

const NEW_VIDEO = {
  id: 'new-video-id',
  playbackId: 'new-playback-id',
  readyToStream: true,
  userId: 'me'
}

function buildCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Mirror production cache.ts which keys this field on teamId so each
          // team (and the personal feed) gets its own partition.
          getMyMuxVideos: offsetLimitPagination(['teamId'])
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
    userId: string
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
        duration: null,
        userId: 'me'
      },
      {
        __typename: 'MuxVideo',
        id: 'existing-2',
        playbackId: 'pb-2',
        readyToStream: true,
        duration: null,
        userId: 'me'
      }
    ])

    prependMuxVideo(cache, NEW_VIDEO)

    const ids = readVideos(cache).map((v) => v.id)
    expect(ids).toEqual([NEW_VIDEO.id, 'existing-1', 'existing-2'])
  })

  it('should prepend into every teamId-keyed partition', () => {
    // Intentional parity with the image picker: prependMuxVideo writes to the
    // unkeyed `getMyMuxVideos` field via cache.modify, so the new video lands at
    // the head of BOTH the personal partition and every team partition. This is
    // the accepted cross-partition behavior (finding #1 was deliberately kept),
    // codified here as a tested contract.
    const cache = buildCache()
    cache.writeQuery({
      query: GET_MY_MUX_VIDEOS,
      variables: { offset: 0, limit: 11 },
      data: {
        getMyMuxVideos: [
          {
            __typename: 'MuxVideo',
            id: 'personal-1',
            playbackId: 'pb-personal',
            readyToStream: true,
            duration: null,
            userId: 'me'
          }
        ]
      }
    })
    cache.writeQuery({
      query: GET_MY_MUX_VIDEOS,
      variables: { offset: 0, limit: 11, teamId: 'team-1' },
      data: {
        getMyMuxVideos: [
          {
            __typename: 'MuxVideo',
            id: 'team-1-video',
            playbackId: 'pb-team',
            readyToStream: true,
            duration: null,
            userId: 'teammate'
          }
        ]
      }
    })

    prependMuxVideo(cache, NEW_VIDEO)

    const personal = cache.readQuery<{
      getMyMuxVideos: Array<{ id: string }>
    }>({
      query: GET_MY_MUX_VIDEOS,
      variables: { offset: 0, limit: 11 }
    })
    const team = cache.readQuery<{
      getMyMuxVideos: Array<{ id: string }>
    }>({
      query: GET_MY_MUX_VIDEOS,
      variables: { offset: 0, limit: 11, teamId: 'team-1' }
    })

    expect(personal?.getMyMuxVideos.map((v) => v.id)).toEqual([
      NEW_VIDEO.id,
      'personal-1'
    ])
    expect(team?.getMyMuxVideos.map((v) => v.id)).toEqual([
      NEW_VIDEO.id,
      'team-1-video'
    ])
  })

  it('should dedup by id so a re-prepend of the same video does not duplicate', () => {
    const cache = buildCache()
    seedCache(cache, [
      {
        __typename: 'MuxVideo',
        id: NEW_VIDEO.id,
        playbackId: NEW_VIDEO.playbackId,
        readyToStream: NEW_VIDEO.readyToStream,
        duration: null,
        userId: 'me'
      },
      {
        __typename: 'MuxVideo',
        id: 'existing-1',
        playbackId: 'pb-1',
        readyToStream: true,
        duration: null,
        userId: 'me'
      }
    ])

    prependMuxVideo(cache, NEW_VIDEO)

    const ids = readVideos(cache).map((v) => v.id)
    expect(ids).toEqual([NEW_VIDEO.id, 'existing-1'])
  })
})
