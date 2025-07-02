import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import fscreen from 'fscreen'
import videojs from 'video.js'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { PlayerProvider } from '../../../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../../../libs/videoContext'
import { WatchProvider } from '../../../../../libs/watchContext'
import { videos } from '../../../../Videos/__generated__/testData'

import { VideoControls } from './VideoControls'

jest.mock('fscreen', () => ({
  __esModule: true,
  default: {
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    addEventListener: jest.fn()
  }
}))

describe('VideoControls', () => {
  let player

  beforeEach(() => {
    jest.clearAllMocks()

    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      ...defaultVideoJsOptions,
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
    render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('PlayArrowRoundedIcon'))
    expect(playStub).toHaveBeenCalled()
  })

  it('pause the video', async () => {
    jest.spyOn(player, 'on').mockImplementation((label, fn: () => void) => {
      if (label === 'play') fn()
    })
    const pauseStub = jest.spyOn(player, 'pause').mockImplementation(() => ({
      pause: jest.fn()
    }))
    render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('PauseRoundedIcon'))
    expect(pauseStub).toHaveBeenCalled()
  })

  it('unmutes the video on mute icon click', () => {
    const mutedStub = jest.spyOn(player, 'muted').mockImplementation(() => ({
      muted: jest.fn()
    }))
    render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getAllByTestId('VolumeOffOutlinedIcon')[0])
    expect(mutedStub).toHaveBeenCalled()
  })

  it('opens audio language dialog on language button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('LanguageOutlinedIcon'))
    await waitFor(() => expect(getByRole('combobox')).toHaveValue('English'))
  })

  it('fullscreens the video player on fullscreen icon click when mobile', () => {
    ;(global.navigator.userAgent as unknown as string) = 'iPhone'
    const fullscreenStub = jest
      .spyOn(player, 'requestFullscreen')
      .mockImplementation(() => ({
        requestFullscreen: jest.fn()
      }))
    const { getByTestId } = render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('FullscreenOutlinedIcon'))
    expect(fullscreenStub).toHaveBeenCalled()
  })

  it('fullscreens the video player on fullscreen icon click when desktop', async () => {
    ;(global.navigator.userAgent as unknown as string) = 'Mac'
    const { getByTestId } = render(
      <MockedProvider>
        <WatchProvider
          initialState={{
            siteLanguage: 'en',
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <PlayerProvider>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
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

  // TODO: Subtitle Dialog click
})
