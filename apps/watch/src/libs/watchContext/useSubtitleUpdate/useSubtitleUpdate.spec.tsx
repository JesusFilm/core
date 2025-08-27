import Player from 'video.js/dist/types/player'

import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../../__generated__/GetSubtitles'

import { subtitleUpdate } from './useSubtitleUpdate'

// Mock video.js player and track interfaces
interface MockTextTrack {
  id?: string
  kind: string
  mode: string
  src?: string
  language?: string
  label?: string
}

interface MockTextTrackList extends Array<MockTextTrack> {
  length: number
}

interface MockPlayer extends Partial<Player> {
  textTracks?: () => MockTextTrackList
  addRemoteTextTrack: jest.Mock
}

describe('subtitleUpdate', () => {
  let mockPlayer: MockPlayer
  let mockTracks: MockTextTrackList
  const mockSubtitleLanguages: SubtitleLanguage[] = [
    {
      __typename: 'VideoSubtitle',
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'en',
        name: [
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: true
          }
        ]
      },
      value: 'https://example.com/subtitles/english.vtt'
    },
    {
      __typename: 'VideoSubtitle',
      language: {
        __typename: 'Language',
        id: '22658',
        bcp47: 'es',
        name: [
          {
            __typename: 'LanguageName',
            value: 'Spanish',
            primary: true
          }
        ]
      },
      value: 'https://example.com/subtitles/spanish.vtt'
    }
  ]

  beforeEach(() => {
    mockTracks = [] as MockTextTrackList
    mockPlayer = {
      textTracks: jest.fn(() => mockTracks),
      addRemoteTextTrack: jest.fn()
    }
  })

  it('should display user preference of subtitle, and subtitle on', () => {
    // Setup: User wants subtitles on with English language
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529', // English
      subtitleOn: true,
      autoSubtitle: null
    })

    // Should add the English subtitle track
    expect(mockPlayer.addRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: '529',
        src: 'https://example.com/subtitles/english.vtt',
        kind: 'subtitles',
        language: 'en',
        label: 'English',
        mode: 'showing',
        default: true
      },
      true
    )
  })

  it('should update the subtitle', () => {
    // Setup: Start with English track existing
    mockTracks.push({
      id: '529',
      kind: 'subtitles',
      mode: 'showing'
    })

    // First call: Add English subtitle
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529',
      subtitleOn: true,
      autoSubtitle: null
    })

    // English track should remain showing, no new track added
    expect(mockTracks[0].mode).toBe('showing')
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled()

    // Reset mock for second call
    mockPlayer.addRemoteTextTrack.mockClear()

    // Add Spanish track to simulate existing tracks
    mockTracks.push({
      id: '22658',
      kind: 'subtitles',
      mode: 'disabled'
    })

    // Second call: Switch to Spanish
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '22658', // Spanish
      subtitleOn: true,
      autoSubtitle: null
    })

    // Should disable English and enable Spanish
    expect(mockTracks[0].mode).toBe('disabled') // English disabled
    expect(mockTracks[1].mode).toBe('showing') // Spanish enabled
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled() // Track already exists
  })

  it('should override user subtitle on preference if autoSubtitle is true', () => {
    // Setup: User has subtitles OFF, but autoSubtitle forces them ON
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529', // English
      subtitleOn: false, // User preference is OFF
      autoSubtitle: true // But availability-based override is ON
    })

    // Should still add subtitle track because autoSubtitle overrides user preference
    expect(mockPlayer.addRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: '529',
        src: 'https://example.com/subtitles/english.vtt',
        kind: 'subtitles',
        language: 'en',
        label: 'English',
        mode: 'showing',
        default: true
      },
      true
    )
  })

  it('should disable all subtitle tracks when subtitles should be off', () => {
    // Setup: Add existing subtitle tracks
    mockTracks.push(
      {
        id: '529',
        kind: 'subtitles',
        mode: 'showing'
      },
      {
        id: '22658',
        kind: 'subtitles',
        mode: 'showing'
      }
    )

    // Call with subtitles disabled
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529',
      subtitleOn: false,
      autoSubtitle: null
    })

    // All subtitle tracks should be disabled
    expect(mockTracks[0].mode).toBe('disabled')
    expect(mockTracks[1].mode).toBe('disabled')
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should handle when autoSubtitle overrides user preference to disable', () => {
    // Setup: Add existing subtitle track
    mockTracks.push({
      id: '529',
      kind: 'subtitles',
      mode: 'showing'
    })

    // User wants subtitles ON, but autoSubtitle forces them OFF
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529',
      subtitleOn: true, // User preference is ON
      autoSubtitle: false // But availability-based override is OFF
    })

    // Should disable subtitle tracks because autoSubtitle overrides user preference
    expect(mockTracks[0].mode).toBe('disabled')
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should return early when player is null', () => {
    subtitleUpdate({
      player: null as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '529',
      subtitleOn: true,
      autoSubtitle: null
    })

    // No operations should be performed
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should return early when selected subtitle language is not found', () => {
    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguages,
      subtitleLanguage: '999', // Non-existent language ID
      subtitleOn: true,
      autoSubtitle: null
    })

    // No track should be added
    expect(mockPlayer.addRemoteTextTrack).not.toHaveBeenCalled()
  })

  it('should handle null language bcp47', () => {
    const mockSubtitleLanguagesWithNullBcp47: SubtitleLanguage[] = [
      {
        __typename: 'VideoSubtitle',
        language: {
          __typename: 'Language',
          id: '529',
          bcp47: null, // Null bcp47
          name: [
            {
              __typename: 'LanguageName',
              value: 'English',
              primary: true
            }
          ]
        },
        value: 'https://example.com/subtitles/english.vtt'
      }
    ]

    subtitleUpdate({
      player: mockPlayer as any,
      videoSubtitleLanguages: mockSubtitleLanguagesWithNullBcp47,
      subtitleLanguage: '529',
      subtitleOn: true,
      autoSubtitle: null
    })

    // Should add track with undefined language when bcp47 is null
    expect(mockPlayer.addRemoteTextTrack).toHaveBeenCalledWith(
      {
        id: '529',
        src: 'https://example.com/subtitles/english.vtt',
        kind: 'subtitles',
        language: undefined, // Should be undefined when bcp47 is null
        label: 'English',
        mode: 'showing',
        default: true
      },
      true
    )
  })
})
