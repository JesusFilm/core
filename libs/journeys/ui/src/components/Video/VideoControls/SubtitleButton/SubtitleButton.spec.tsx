import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { getCaptionsAndSubtitleTracks as _getCaptionsAndSubtitleTracks } from '../../utils/getCaptionsAndSubtitleTracks'
import { getYouTubePlayer as _getYouTubePlayer } from '../../utils/getYouTubePlayer'
import { hideAllSubtitles as _hideAllSubtitles } from '../../utils/hideAllSubtitles'
import { setYouTubeCaptionTrack as _setYouTubeCaptionTrack } from '../../utils/setYouTubeCaptionTrack'
import { unloadYouTubeCaptions as _unloadYouTubeCaptions } from '../../utils/unloadYouTubeCaptions'
import VideoJsPlayer from '../../utils/videoJsTypes'

import { SubtitleButton } from './SubtitleButton'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))
vi.mock('../../utils/getCaptionsAndSubtitleTracks', () => ({
  getCaptionsAndSubtitleTracks: vi.fn()
}))

vi.mock('../../utils/hideAllSubtitles', () => ({
  hideAllSubtitles: vi.fn()
}))

vi.mock('../../utils/getYouTubePlayer', () => ({
  getYouTubePlayer: vi.fn()
}))

vi.mock('../../utils/setYouTubeCaptionTrack', () => ({
  setYouTubeCaptionTrack: vi.fn()
}))

vi.mock('../../utils/unloadYouTubeCaptions', () => ({
  unloadYouTubeCaptions: vi.fn()
}))
const getCaptionsAndSubtitleTracks = vi.mocked(_getCaptionsAndSubtitleTracks)
const hideAllSubtitles = vi.mocked(_hideAllSubtitles)
const getYouTubePlayer = vi.mocked(_getYouTubePlayer)
const setYouTubeCaptionTrack = vi.mocked(_setYouTubeCaptionTrack)
const unloadYouTubeCaptions = vi.mocked(_unloadYouTubeCaptions)

describe('SubtitleButton', () => {
  let player: VideoJsPlayer
  let mockTrack1: TextTrack
  let mockTrack2: TextTrack

  beforeEach(() => {
    vi.clearAllMocks()

    player = {
      textTracks: vi.fn(() => {
        const tracks = [mockTrack1, mockTrack2]
        const trackList = Object.assign(tracks, {
          length: tracks.length,
          item: vi.fn((index: number) => tracks[index] || null)
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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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
      setOption: vi.fn(),
      loadModule: vi.fn()
    } as unknown as ReturnType<typeof _getYouTubePlayer>
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    getCaptionsAndSubtitleTracks.mockReturnValue([mockTrack1, mockTrack2])

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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
      setOption: vi.fn(),
      loadModule: vi.fn()
    } as unknown as ReturnType<typeof _getYouTubePlayer>
    getYouTubePlayer.mockReturnValue(mockYtPlayer)
    const activeTrack = { ...mockTrack1, mode: 'showing' as TextTrackMode }
    getCaptionsAndSubtitleTracks.mockReturnValue([activeTrack, mockTrack2])

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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

    const setActive = vi.fn()

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
