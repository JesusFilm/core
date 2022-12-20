import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor
} from '@testing-library/react'
import videojs from 'video.js'
import fscreen from 'fscreen'
import { VideoControls } from './VideoControls'

jest.mock('fscreen', () => ({
  __esModule: true,
  default: {
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn()
  }
}))

describe('VideoControls', () => {
  let player
  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      autoplay: false,
      controls: true,
      userActions: {
        hotkeys: true,
        doubleClick: true
      },
      controlBar: {
        playToggle: true,
        remainingTimeDisplay: true,
        progressControl: {
          seekBar: true
        },
        fullscreenToggle: true,
        volumePanel: {
          inline: false
        }
      },
      responsive: true
    })
    act(() => {
      player.duration(250)
    })
  })
  afterEach(() => {
    cleanup()
  })

  it('plays the video', () => {
    const playStub = jest.spyOn(player, 'play').mockImplementation(() => ({
      play: jest.fn()
    }))
    const { getByTestId } = render(<VideoControls player={player} />)
    fireEvent.click(getByTestId('PlayArrowRoundedIcon'))
    expect(playStub).toHaveBeenCalled()
  })

  it('pause the video', async () => {
    jest.spyOn(player, 'on').mockImplementation((label, fn: () => void) => {
      if (label === 'play') fn()
    })
    const pauseStub = jest.spyOn(player, 'pause').mockImplementation(() => ({
      pause: jest.fn()
    }))
    const { getByTestId } = render(<VideoControls player={player} />)
    fireEvent.click(getByTestId('PauseRoundedIcon'))
    expect(pauseStub).toHaveBeenCalled()
  })

  it('mutes the video on mute icon click', () => {
    const mutedStub = jest.spyOn(player, 'muted').mockImplementation(() => ({
      muted: jest.fn()
    }))
    const { getByTestId } = render(<VideoControls player={player} />)
    fireEvent.click(getByTestId('VolumeUpOutlinedIcon'))
    expect(mutedStub).toHaveBeenCalled()
  })

  it('fullscreens the video player on fullscreen icon click when mobile', () => {
    ;(global.navigator.userAgent as unknown as string) = 'iPhone'
    const fullscreenStub = jest
      .spyOn(player, 'requestFullscreen')
      .mockImplementation(() => ({
        requestFullscreen: jest.fn()
      }))
    const { getByTestId } = render(<VideoControls player={player} />)
    fireEvent.click(getByTestId('FullscreenOutlinedIcon'))
    expect(fullscreenStub).toHaveBeenCalled()
  })

  it('fullscreens the video player on fullscreen icon click when desktop', async () => {
    ;(global.navigator.userAgent as unknown as string) = 'Mac'
    const { getByTestId } = render(<VideoControls player={player} />)
    fireEvent.click(getByTestId('FullscreenOutlinedIcon'))
    expect(fscreen.requestFullscreen).toHaveBeenCalled()
    await waitFor(() =>
      expect(getByTestId('FullscreenExitOutlinedIcon')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('FullscreenExitOutlinedIcon'))
    expect(fscreen.exitFullscreen).toHaveBeenCalled()
    await waitFor(() =>
      expect(getByTestId('FullscreenOutlinedIcon')).toBeInTheDocument()
    )
  })

  // TODO: add test on Language and Subtitle Dialog click
})
