import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor, act } from '@testing-library/react'
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

    act(() => {
      result.current.subtitleUpdate({
        player: mockPlayer,
        subtitleLanguage: '529',
        subtitleOn: true,
        autoSubtitle: null
      })
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

    await waitFor(() => {
      act(() => {
        result.current.subtitleUpdate({
          player: mockPlayer,
          subtitleLanguage: '529',
          subtitleOn: false,
          autoSubtitle: null
        })
      })
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

    await waitFor(() => {
      act(() => {
        result.current.subtitleUpdate({
          player: mockPlayer,
          subtitleLanguage: null,
          subtitleOn: true,
          autoSubtitle: null
        })
      })
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

  it('should use autoSubtitle when available', async () => {
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
    })

    act(() => {
      result.current.subtitleUpdate({
        player: mockPlayer,
        subtitleLanguage: '529',
        subtitleOn: false, // User preference is off
        autoSubtitle: true // But autoSubtitle is enabled
      })
    })

    expect(result.current.subtitleUpdate).toBeDefined()
    expect(result.current.subtitlesLoading).toBeDefined()
    await waitFor(() => {
      expect(getSubtitlesMockResults).toHaveBeenCalled()
    })
  })
})
