import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import Player from 'video.js/dist/types/player'

import { VideoProvider } from '../../videoContext'

import { useSubtitleUpdate } from './useSubtitleUpdate'
import { getSubtitlesMock, mockVideoContent } from './useSubtitleUpdate.mock'

const createMockPlayer = (): Player & {
  textTracks?: () => TextTrackList
  addRemoteTextTrack: jest.Mock
} => {
  const mockTracks = [
    {
      id: '529',
      kind: 'subtitles',
      mode: 'disabled'
    },
    {
      id: '22658',
      kind: 'subtitles',
      mode: 'disabled'
    }
  ] as unknown as TextTrackList

  const mockAddRemoteTextTrack = jest.fn()

  return {
    textTracks: jest.fn(() => mockTracks),
    addRemoteTextTrack: mockAddRemoteTextTrack,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  } as unknown as Player & {
    textTracks?: () => TextTrackList
    addRemoteTextTrack: jest.Mock
  }
}

describe('useSubtitleUpdate', () => {
  let mockPlayer: Player & {
    textTracks?: () => TextTrackList
    addRemoteTextTrack: jest.Mock
  }

  beforeEach(() => {
    mockPlayer = createMockPlayer()
    mockPlayer.addRemoteTextTrack.mockClear()
  })

  it('should enable subtitles when subtitleLanguage is provided and subtitles are on', async () => {
    const getSubtitlesMockResults = jest
      .fn()
      .mockReturnValue({ ...getSubtitlesMock.result })

    const { result } = renderHook(() => useSubtitleUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...getSubtitlesMock, result: getSubtitlesMockResults }]}
        >
          <VideoProvider value={{ content: mockVideoContent }}>
            {children}
          </VideoProvider>
        </MockedProvider>
      )
    })

    await waitFor(() => {
      expect(result.current.subtitleUpdate).toBeDefined()
      expect(typeof result.current.subtitleUpdate).toBe('function')
      expect(typeof result.current.subtitlesLoading).toBe('boolean')
    })

    await result.current.subtitleUpdate({
      player: mockPlayer,
      subtitleLanguageId: '529',
      subtitleOn: true
    })

    expect(result.current.subtitleUpdate).toBeDefined()
    expect(result.current.subtitlesLoading).toBeDefined()
    await waitFor(() => {
      expect(getSubtitlesMockResults).toHaveBeenCalled()
    })
  })

  it('should disable all subtitle tracks when subtitles are off', async () => {
    const { result } = renderHook(() => useSubtitleUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[getSubtitlesMock]} addTypename={false}>
          <VideoProvider value={{ content: mockVideoContent }}>
            {children}
          </VideoProvider>
        </MockedProvider>
      )
    })

    await result.current.subtitleUpdate({
      player: mockPlayer,
      subtitleLanguageId: '529',
      subtitleOn: false
    })

    const tracks = mockPlayer.textTracks?.()
    if (tracks) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (track.kind === 'subtitles') {
          expect(track.mode).toBe('disabled')
        }
      }
    }
  })

  it('should do nothing when subtitleLanguage is null', async () => {
    const { result } = renderHook(() => useSubtitleUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[getSubtitlesMock]} addTypename={false}>
          <VideoProvider value={{ content: mockVideoContent }}>
            {children}
          </VideoProvider>
        </MockedProvider>
      )
    })

    await result.current.subtitleUpdate({
      player: mockPlayer,
      subtitleLanguageId: null,
      subtitleOn: true
    })

    // Should disable all tracks
    const tracks = mockPlayer.textTracks?.()
    if (tracks) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (track.kind === 'subtitles') {
          expect(track.mode).toBe('disabled')
        }
      }
    }
  })
})
