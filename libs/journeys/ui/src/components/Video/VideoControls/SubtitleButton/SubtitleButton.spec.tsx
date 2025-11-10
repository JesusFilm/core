import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'

import { SubtitleButton } from './SubtitleButton'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))
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

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })

  it('should render enabled state when tracks are available but none selected', () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).not.toBeDisabled()
  })

  it('should render selected state when track is active', () => {
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).not.toBeDisabled()
  })

  it('should open menu when button is clicked and visible is true', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith(true)
    })
  })

  it('should not open menu when visible is false', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={false}
        setActive={setActive}
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

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const trackMenuItem = screen.getByText('English')
    fireEvent.click(trackMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(setActive).toHaveBeenCalledWith(false)
  })

  it('should handle YouTube video subtitle toggle', async () => {
    const mockYtPlayer = {
      setOption: jest.fn(),
      loadModule: jest.fn()
    }
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.youTube}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const trackMenuItem = screen.getByText('English')
    fireEvent.click(trackMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(getYouTubePlayer).toHaveBeenCalledWith(player)
    expect(setYouTubeCaptionTrack).toHaveBeenCalledWith(mockYtPlayer, 'en')
    expect(setActive).toHaveBeenCalledWith(false)
  })

  it('should handle turning off subtitles', async () => {
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const offMenuItem = screen.getByText('Off')
    fireEvent.click(offMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(setActive).toHaveBeenCalledWith(false)
  })

  it('should handle turning off YouTube subtitles', async () => {
    const mockYtPlayer = {
      setOption: jest.fn(),
      loadModule: jest.fn()
    }
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.youTube}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const offMenuItem = screen.getByText('Off')
    fireEvent.click(offMenuItem)

    expect(hideAllSubtitles).toHaveBeenCalledWith(player)
    expect(getYouTubePlayer).toHaveBeenCalledWith(player)
    expect(unloadYouTubeCaptions).toHaveBeenCalledWith(mockYtPlayer)
    expect(setActive).toHaveBeenCalledWith(false)
  })

  it('should handle player with no textTracks method', () => {
    const playerWithoutTextTracks = {
      ...player,
      textTracks: undefined
    } as unknown as VideoJsPlayer

    getCaptionsAndSubtitleTracks.mockReturnValue([])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={playerWithoutTextTracks}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })

  it('should handle empty track list gracefully', () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    expect(button).toBeDisabled()
  })

  it('should call setActive to persist controls visibility when menu opens', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(setActive).toHaveBeenCalledWith(true)
    })
  })

  it('should call setActive to hide controls when menu closes', async () => {
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = jest.fn()

    render(
      <SubtitleButton
        player={player}
        source={VideoBlockSource.internal}
        visible={true}
        setActive={setActive}
      />
    )

    const button = screen.getByRole('button', { name: 'subtitles' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const backdrop = document.querySelector('.MuiBackdrop-root')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith(false)
    })
  })
})
