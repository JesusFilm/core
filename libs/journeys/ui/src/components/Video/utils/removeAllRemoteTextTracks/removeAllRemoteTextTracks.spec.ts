import VideoJsPlayer from '../videoJsTypes'

import { removeAllRemoteTextTracks } from './removeAllRemoteTextTracks'

describe('removeAllRemoteTextTracks', () => {
  let mockPlayer: VideoJsPlayer
  let mockRemoteTextTracks: TextTrackList
  let mockTracks: TextTrack[]
  let mockRemoveRemoteTextTrack: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockRemoveRemoteTextTrack = jest.fn()
    mockTracks = [
      {
        id: 'track1',
        kind: 'subtitles',
        label: 'English',
        language: 'en'
      } as TextTrack,
      {
        id: 'track2',
        kind: 'captions',
        label: 'Spanish',
        language: 'es'
      } as TextTrack,
      {
        id: 'track3',
        kind: 'descriptions',
        label: 'Audio Description',
        language: 'en'
      } as TextTrack,
      {
        id: 'track4',
        kind: 'metadata',
        label: 'Metadata',
        language: ''
      } as TextTrack
    ]

    // Create mock TextTrackList
    mockRemoteTextTracks = mockTracks as unknown as TextTrackList

    mockPlayer = {
      remoteTextTracks: jest.fn(() => mockRemoteTextTracks),
      removeRemoteTextTrack: mockRemoveRemoteTextTrack
    } as unknown as VideoJsPlayer
  })

  it('should remove all remote text tracks with valid IDs', () => {
    removeAllRemoteTextTracks(mockPlayer)

    expect(mockPlayer.remoteTextTracks).toHaveBeenCalled()
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledTimes(4)
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mockTracks[0])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mockTracks[1])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mockTracks[2])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mockTracks[3])
  })

  it('should iterate tracks in reverse order', () => {
    const callOrder: TextTrack[] = []
    mockRemoveRemoteTextTrack.mockImplementation((track) => {
      callOrder.push(track)
    })

    removeAllRemoteTextTracks(mockPlayer)

    // Should be called in reverse order (last track first)
    expect(callOrder).toEqual([
      mockTracks[3],
      mockTracks[2],
      mockTracks[1],
      mockTracks[0]
    ])
  })

  it('should skip tracks with null or undefined IDs', () => {
    const tracksWithNullIds = [
      { id: 'track1', kind: 'subtitles' } as unknown as TextTrack,
      { id: null, kind: 'captions' } as unknown as TextTrack,
      { id: undefined, kind: 'descriptions' } as unknown as TextTrack,
      { id: 'track4', kind: 'metadata' } as unknown as TextTrack
    ]

    const remoteTextTracksWithNullIds =
      tracksWithNullIds as unknown as TextTrackList
    mockPlayer.remoteTextTracks = jest.fn(() => remoteTextTracksWithNullIds)

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledTimes(2)
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(tracksWithNullIds[0])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(tracksWithNullIds[3])
  })

  it('should handle empty remote text tracks', () => {
    const emptyRemoteTextTracks = [] as unknown as TextTrackList
    mockPlayer.remoteTextTracks = jest.fn(() => emptyRemoteTextTracks)

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockPlayer.remoteTextTracks).toHaveBeenCalled()
    expect(mockRemoveRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should handle null remoteTextTracks', () => {
    mockPlayer.remoteTextTracks = jest.fn(
      () => null as unknown as TextTrackList
    )

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockPlayer.remoteTextTracks).toHaveBeenCalled()
    expect(mockRemoveRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should handle undefined remoteTextTracks', () => {
    mockPlayer.remoteTextTracks = jest.fn(
      () => undefined as unknown as TextTrackList
    )

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockPlayer.remoteTextTracks).toHaveBeenCalled()
    expect(mockRemoveRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should handle tracks with null or undefined properties gracefully', () => {
    const tracksWithNulls = [
      {
        id: 'track1',
        kind: null,
        label: undefined,
        language: null
      } as unknown as TextTrack,
      {
        id: null,
        kind: 'captions',
        label: null,
        language: undefined
      } as unknown as TextTrack,
      {
        id: 'track3',
        kind: undefined,
        label: 'Description',
        language: 'en'
      } as unknown as TextTrack
    ]

    const remoteTextTracksWithNulls =
      tracksWithNulls as unknown as TextTrackList
    mockPlayer.remoteTextTracks = jest.fn(() => remoteTextTracksWithNulls)

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledTimes(2)
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(tracksWithNulls[0])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(tracksWithNulls[2])
  })

  it('should handle mixed track types correctly', () => {
    const mixedTracks = [
      { id: 'sub1', kind: 'subtitles', label: 'English' } as TextTrack,
      { id: 'cap1', kind: 'captions', label: 'Spanish' } as TextTrack,
      {
        id: 'desc1',
        kind: 'descriptions',
        label: 'Audio Description'
      } as TextTrack,
      { id: 'meta1', kind: 'metadata', label: 'Metadata' } as TextTrack
    ]

    const mixedRemoteTextTracks = mixedTracks as unknown as TextTrackList
    mockPlayer.remoteTextTracks = jest.fn(() => mixedRemoteTextTracks)

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledTimes(4)
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mixedTracks[0])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mixedTracks[1])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mixedTracks[2])
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(mixedTracks[3])
  })

  it('should handle single track', () => {
    const singleTrack = [
      { id: 'single', kind: 'subtitles', label: 'English' } as TextTrack
    ]

    const singleRemoteTextTracks = singleTrack as unknown as TextTrackList
    mockPlayer.remoteTextTracks = jest.fn(() => singleRemoteTextTracks)

    removeAllRemoteTextTracks(mockPlayer)

    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledTimes(1)
    expect(mockRemoveRemoteTextTrack).toHaveBeenCalledWith(singleTrack[0])
  })
})
