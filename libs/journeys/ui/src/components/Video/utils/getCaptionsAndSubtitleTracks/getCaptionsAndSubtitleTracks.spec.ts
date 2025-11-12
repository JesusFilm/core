import VideoJsPlayer from '../videoJsTypes'

import { getCaptionsAndSubtitleTracks } from './getCaptionsAndSubtitleTracks'

describe('getCaptionsAndSubtitleTracks', () => {
  let mockPlayer: VideoJsPlayer
  let mockTextTracks: TextTrackList
  let mockTracks: TextTrack[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockTracks = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack,
      {
        kind: 'chapters',
        mode: 'showing',
        label: 'Chapters',
        language: '',
        id: 'chapters'
      } as TextTrack,
      {
        kind: 'metadata',
        mode: 'showing',
        label: 'Metadata',
        language: '',
        id: 'metadata'
      } as TextTrack,
      {
        kind: 'descriptions',
        mode: 'showing',
        label: 'Audio Descriptions',
        language: 'en',
        id: 'desc-en'
      } as TextTrack
    ]

    // Create mock TextTrackList
    mockTextTracks = mockTracks as unknown as TextTrackList

    mockPlayer = {
      textTracks: jest.fn(() => mockTextTracks)
    } as unknown as VideoJsPlayer
  })

  it('should return only subtitle and caption tracks', () => {
    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(mockTracks[0]) // subtitles track
    expect(result[1]).toBe(mockTracks[1]) // captions track
  })

  it('should filter out chapters tracks', () => {
    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).not.toContain(mockTracks[2]) // chapters track
  })

  it('should filter out metadata tracks', () => {
    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).not.toContain(mockTracks[3]) // metadata track
  })

  it('should filter out descriptions tracks', () => {
    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).not.toContain(mockTracks[4]) // descriptions track
  })

  it('should handle empty text tracks', () => {
    const emptyTextTracks = [] as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(result).toHaveLength(0)
  })

  it('should handle null textTracks by creating new TextTrackList', () => {
    const emptyTextTracks = [] as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(result).toHaveLength(0)
  })

  it('should handle undefined textTracks by creating new TextTrackList', () => {
    const emptyTextTracks = [] as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(result).toHaveLength(0)
  })

  it('should return only subtitles when no captions present', () => {
    const subtitlesOnlyTracks = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack,
      {
        kind: 'chapters',
        mode: 'showing',
        label: 'Chapters',
        language: '',
        id: 'chapters'
      } as TextTrack
    ]

    const subtitlesOnlyTextTracks =
      subtitlesOnlyTracks as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => subtitlesOnlyTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(subtitlesOnlyTracks[0])
  })

  it('should return only captions when no subtitles present', () => {
    const captionsOnlyTracks = [
      {
        kind: 'captions',
        mode: 'showing',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack,
      {
        kind: 'metadata',
        mode: 'showing',
        label: 'Metadata',
        language: '',
        id: 'metadata'
      } as TextTrack
    ]

    const captionsOnlyTextTracks =
      captionsOnlyTracks as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => captionsOnlyTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(captionsOnlyTracks[0])
  })

  it('should handle multiple subtitle and caption tracks', () => {
    const multipleTracks = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'hidden',
        label: 'Spanish',
        language: 'es',
        id: 'sub-es'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'disabled',
        label: 'Spanish CC',
        language: 'es',
        id: 'cap-es'
      } as TextTrack,
      {
        kind: 'chapters',
        mode: 'showing',
        label: 'Chapters',
        language: '',
        id: 'chapters'
      } as TextTrack
    ]

    const multipleTextTracks = multipleTracks as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => multipleTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(4)
    expect(result[0]).toBe(multipleTracks[0]) // English subtitles
    expect(result[1]).toBe(multipleTracks[1]) // Spanish subtitles
    expect(result[2]).toBe(multipleTracks[2]) // English captions
    expect(result[3]).toBe(multipleTracks[3]) // Spanish captions
  })

  it('should handle tracks with different modes', () => {
    const tracksWithDifferentModes = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'hidden',
        label: 'Spanish',
        language: 'es',
        id: 'sub-es'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'disabled',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack
    ]

    const tracksWithDifferentModesTextTracks =
      tracksWithDifferentModes as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => tracksWithDifferentModesTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(3)
    expect(result[0].mode).toBe('showing')
    expect(result[1].mode).toBe('hidden')
    expect(result[2].mode).toBe('disabled')
  })

  it('should handle tracks with null or undefined properties gracefully', () => {
    const tracksWithNulls = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: null as any,
        language: null as any,
        id: 'sub-null'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: undefined as any,
        language: undefined as any,
        id: 'cap-undefined'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'showing',
        label: '',
        language: '',
        id: 'sub-empty'
      } as TextTrack
    ]

    const textTracksWithNulls = tracksWithNulls as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => textTracksWithNulls)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(3)
    expect(result[0]).toBe(tracksWithNulls[0])
    expect(result[1]).toBe(tracksWithNulls[1])
    expect(result[2]).toBe(tracksWithNulls[2])
  })

  it('should handle tracks with mixed case kind values', () => {
    const tracksWithMixedCase = [
      {
        kind: 'Subtitles' as any, // Mixed case
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack,
      {
        kind: 'CAPTIONS' as any, // Upper case
        mode: 'showing',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'Spanish',
        language: 'es',
        id: 'sub-es'
      } as TextTrack
    ]

    const tracksWithMixedCaseTextTracks =
      tracksWithMixedCase as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => tracksWithMixedCaseTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    // Should only return the lowercase 'subtitles' track, not the mixed case ones
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(tracksWithMixedCase[2])
  })

  it('should preserve track order from original list', () => {
    const orderedTracks = [
      {
        kind: 'captions',
        mode: 'showing',
        label: 'English CC',
        language: 'en',
        id: 'cap-en'
      } as TextTrack,
      {
        kind: 'chapters',
        mode: 'showing',
        label: 'Chapters',
        language: '',
        id: 'chapters'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'Spanish',
        language: 'es',
        id: 'sub-es'
      } as TextTrack,
      {
        kind: 'metadata',
        mode: 'showing',
        label: 'Metadata',
        language: '',
        id: 'metadata'
      } as TextTrack,
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en',
        id: 'sub-en'
      } as TextTrack
    ]

    const orderedTextTracks = orderedTracks as unknown as TextTrackList
    mockPlayer.textTracks = jest.fn(() => orderedTextTracks)

    const result = getCaptionsAndSubtitleTracks(mockPlayer)

    expect(result).toHaveLength(3)
    expect(result[0]).toBe(orderedTracks[0]) // captions first
    expect(result[1]).toBe(orderedTracks[2]) // subtitles second
    expect(result[2]).toBe(orderedTracks[4]) // subtitles third
  })

  it('should handle player with no textTracks method', () => {
    const playerWithoutTextTracks = {} as VideoJsPlayer

    // Mock TextTrackList constructor for this test
    const originalTextTrackList = global.TextTrackList
    global.TextTrackList = jest.fn(() => []) as any

    const result = getCaptionsAndSubtitleTracks(playerWithoutTextTracks)

    expect(result).toHaveLength(0)

    // Restore original TextTrackList
    global.TextTrackList = originalTextTrackList
  })
})
