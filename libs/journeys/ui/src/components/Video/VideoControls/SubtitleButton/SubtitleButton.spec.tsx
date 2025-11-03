import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'

import { SubtitleButton } from './SubtitleButton'

// Mock the translation function
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// Mock the utility functions
jest.mock('../../utils/getCaptionsAndSubtitleTracks', () => ({
  getCaptionsAndSubtitleTracks: jest.fn()
}))

jest.mock('../../utils/hideAllSubtitles', () => ({
  hideAllSubtitles: jest.fn()
}))

jest.mock('../../utils/getYouTubePlayer', () => ({
  getYouTubePlayer: jest.fn()
}))

jest.mock('../../utils/setYouTubeCaptionTrack', () => ({
  setYouTubeCaptionTrack: jest.fn()
}))

jest.mock('../../utils/unloadYouTubeCaptions', () => ({
  unloadYouTubeCaptions: jest.fn()
}))

// Import the mocked functions
const { getCaptionsAndSubtitleTracks } = jest.requireMock(
  '../../utils/getCaptionsAndSubtitleTracks'
)
const { hideAllSubtitles } = jest.requireMock('../../utils/hideAllSubtitles')
const { getYouTubePlayer } = jest.requireMock('../../utils/getYouTubePlayer')
const { setYouTubeCaptionTrack } = jest.requireMock(
  '../../utils/setYouTubeCaptionTrack'
)
const { unloadYouTubeCaptions } = jest.requireMock(
  '../../utils/unloadYouTubeCaptions'
)

describe('SubtitleButton', () => {
  let player: VideoJsPlayer
  let mockTrack1: TextTrack
  let mockTrack2: TextTrack

  beforeEach(() => {
    jest.clearAllMocks()

    // Create a minimal mock player
    player = {
      textTracks: jest.fn(() => {
        const tracks = [mockTrack1, mockTrack2]
        const trackList = Object.assign(tracks, {
          length: tracks.length,
          item: jest.fn((index: number) => tracks[index] || null)
        })
        return trackList
      })
    } as unknown as VideoJsPlayer

    // Create mock text tracks
    mockTrack1 = {
      id: 'track1',
      label: 'English',
      language: 'en',
      kind: 'subtitles',
      mode: 'hidden'
    } as TextTrack

    mockTrack2 = {
      id: 'track2',
      label: 'Spanish',
      language: 'es',
      kind: 'subtitles',
      mode: 'hidden'
    } as TextTrack
  })

  it('should render disabled state when no tracks are available', () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })

  it('should render enabled state when tracks are available but none selected', () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).not.toBeDisabled()
  })

  it('should render selected state when track is active', () => {
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).not.toBeDisabled()
  })

  it('should open menu when button is clicked and visible is true', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  it('should not open menu when visible is false', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={false}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('should handle HTML5 video subtitle toggle', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    // Click on a subtitle track
    const trackMenuItem = screen.getByText('English')
    fireEvent.click(trackMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
  })

  it('should handle YouTube video subtitle toggle', async () => {
    const mockYtPlayer = {
      setOption: jest.fn(),
      loadModule: jest.fn()
    }
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.youTube}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    // Click on a subtitle track
    const trackMenuItem = screen.getByText('English')
    fireEvent.click(trackMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(getYouTubePlayer).toHaveBeenCalledWith(player)
    expect(setYouTubeCaptionTrack).toHaveBeenCalledWith(mockYtPlayer, 'en')
  })

  it('should handle turning off subtitles', async () => {
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    // Click on "Off" option
    const offMenuItem = screen.getByText('Off')
    fireEvent.click(offMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
  })

  it('should handle turning off YouTube subtitles', async () => {
    const mockYtPlayer = {
      setOption: jest.fn(),
      loadModule: jest.fn()
    }
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.youTube}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    // Click on "Off" option
    const offMenuItem = screen.getByText('Off')
    fireEvent.click(offMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(getYouTubePlayer).toHaveBeenCalledWith(player)
    expect(unloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
  })

  it('should handle player with no textTracks method', () => {
    const playerWithoutTextTracks = {
      ...player,
      textTracks: undefined
    } as unknown as VideoJsPlayer

    getCaptionsAndSubtitleTracks.mockReturnValue([])

    render(
      <SubtitleButton
        player={playerWithoutTextTracks}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })

  it('should handle empty track list gracefully', () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([])

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })
})
