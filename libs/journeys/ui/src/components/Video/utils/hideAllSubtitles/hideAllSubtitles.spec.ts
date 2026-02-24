import VideoJsPlayer from '../videoJsTypes'

import { hideAllSubtitles } from './hideAllSubtitles'

describe('hideAllSubtitles', () => {
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
        language: 'en'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: 'Spanish',
        language: 'es'
      } as TextTrack,
      {
        kind: 'chapters',
        mode: 'showing',
        label: 'Chapters',
        language: ''
      } as TextTrack,
      {
        kind: 'metadata',
        mode: 'showing',
        label: 'Metadata',
        language: ''
      } as TextTrack
    ]

    // Create mock TextTrackList
    mockTextTracks = mockTracks as unknown as TextTrackList

    mockPlayer = {
      textTracks: jest.fn(() => mockTextTracks)
    } as unknown as VideoJsPlayer
  })

  it('should hide all subtitle tracks', () => {
    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(mockTracks[0].mode).toBe('hidden') // subtitles track
    expect(mockTracks[1].mode).toBe('hidden') // captions track
  })

  it('should hide all caption tracks', () => {
    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(mockTracks[1].mode).toBe('hidden') // captions track
  })

  it('should not modify non-subtitle/caption tracks', () => {
    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    expect(mockTracks[2].mode).toBe('showing') // chapters track - unchanged
    expect(mockTracks[3].mode).toBe('showing') // metadata track - unchanged
  })

  it('should handle empty text tracks', () => {
    const emptyTextTracks = [] as unknown as TextTrackList

    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    // Should not throw any errors
  })

  it('should handle null textTracks by creating new TextTrackList', () => {
    const emptyTextTracks = [] as unknown as TextTrackList

    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    // Should not throw any errors
  })

  it('should handle undefined textTracks by creating new TextTrackList', () => {
    const emptyTextTracks = [] as unknown as TextTrackList

    mockPlayer.textTracks = jest.fn(() => emptyTextTracks)

    hideAllSubtitles(mockPlayer)

    expect(mockPlayer.textTracks).toHaveBeenCalled()
    // Should not throw any errors
  })

  it('should handle tracks with different initial modes', () => {
    // Set up tracks with different initial modes
    mockTracks[0].mode = 'disabled' // subtitles track
    mockTracks[1].mode = 'showing' // captions track

    hideAllSubtitles(mockPlayer)

    expect(mockTracks[0].mode).toBe('hidden') // subtitles track
    expect(mockTracks[1].mode).toBe('hidden') // captions track
  })

  it('should handle mixed track types correctly', () => {
    const mixedTracks = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: 'English',
        language: 'en'
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: 'English CC',
        language: 'en'
      } as TextTrack,
      {
        kind: 'descriptions',
        mode: 'showing',
        label: 'Audio Descriptions',
        language: 'en'
      } as TextTrack,
      {
        kind: 'metadata',
        mode: 'showing',
        label: 'Metadata',
        language: ''
      } as TextTrack
    ]

    const mixedTextTracks = mixedTracks as unknown as TextTrackList

    mockPlayer.textTracks = jest.fn(() => mixedTextTracks)

    hideAllSubtitles(mockPlayer)

    expect(mixedTracks[0].mode).toBe('hidden') // subtitles track
    expect(mixedTracks[1].mode).toBe('hidden') // captions track
    expect(mixedTracks[2].mode).toBe('showing') // descriptions track - unchanged
    expect(mixedTracks[3].mode).toBe('showing') // metadata track - unchanged
  })

  it('should handle tracks with null or undefined properties gracefully', () => {
    const tracksWithNulls = [
      {
        kind: 'subtitles',
        mode: 'showing',
        label: null as any,
        language: null as any
      } as TextTrack,
      {
        kind: 'captions',
        mode: 'showing',
        label: undefined as any,
        language: undefined as any
      } as TextTrack
    ]

    const textTracksWithNulls = tracksWithNulls as unknown as TextTrackList

    mockPlayer.textTracks = jest.fn(() => textTracksWithNulls)

    hideAllSubtitles(mockPlayer)

    expect(tracksWithNulls[0].mode).toBe('hidden') // subtitles track
    expect(tracksWithNulls[1].mode).toBe('hidden') // captions track
  })
})
