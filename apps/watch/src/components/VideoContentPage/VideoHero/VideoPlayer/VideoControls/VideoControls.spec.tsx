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

import { VideoContentFields } from '../../../../../../__generated__/VideoContentFields'
import { PlayerProvider } from '../../../../../libs/playerContext/PlayerContext'
import { TestPlayerState } from '../../../../../libs/playerContext/TestPlayerState'
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

  it('plays the video', async () => {
    jest.spyOn(player, 'play').mockImplementation(function () {
      this.trigger('play')
    })

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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(screen.getByText('player.play: false')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('PlayArrowRoundedIcon'))
    await waitFor(() => {
      expect(screen.getByText('player.play: true')).toBeInTheDocument()
    })
  })

  it('pause the video', async () => {
    jest.spyOn(player, 'pause').mockImplementation(function () {
      this.trigger('pause')
    })

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
          <PlayerProvider initialState={{ play: true }}>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('PauseRoundedIcon'))
    expect(screen.getByText('player.play: false')).toBeInTheDocument()
  })

  it('unmutes the video on mute icon click', async () => {
    jest.spyOn(player, 'muted').mockImplementation(function () {
      this.trigger('muted')
    })

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
          <PlayerProvider initialState={{ mute: true }}>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('player.mute: true')).toBeInTheDocument()
    })
    fireEvent.click(screen.getAllByTestId('VolumeOffOutlinedIcon')[0])
    await waitFor(() => {
      expect(screen.getByText('player.mute: false')).toBeInTheDocument()
    })
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

  it('fullscreens the video player on fullscreen icon click when mobile', async () => {
    jest.spyOn(player, 'requestFullscreen').mockImplementation(function () {
      this.trigger('requestFullscreen')
    })
    ;(global.navigator.userAgent as unknown as string) = 'iPhone'

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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('FullscreenOutlinedIcon'))
    await waitFor(() => {
      expect(screen.getByText('player.fullscreen: true')).toBeInTheDocument()
    })
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
              <TestPlayerState />
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
    await waitFor(() => {
      expect(screen.getByText('player.fullscreen: true')).toBeInTheDocument()
    })
    fireEvent.click(getByTestId('FullscreenExitOutlinedIcon'))
    expect(fscreen.exitFullscreen).toHaveBeenCalled()
    await waitFor(() =>
      expect(getByTestId('FullscreenOutlinedIcon')).toBeInTheDocument()
    )
    await waitFor(() => {
      expect(screen.getByText('player.fullscreen: false')).toBeInTheDocument()
    })
  })

  it('opens subtitle dialog on subtitle icon click', async () => {
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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('player.openSubtitleDialog: false')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('SubtitlesOutlinedIcon'))
    await waitFor(() => {
      expect(
        screen.getByText('player.openSubtitleDialog: true')
      ).toBeInTheDocument()
    })
  })

  it('updates progress on timeupdate event handler', async () => {
    jest.spyOn(player, 'currentTime').mockReturnValue(0)
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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(screen.getByText('player.currentTime: 0:00')).toBeInTheDocument()
    expect(screen.getByText('player.progress: 0')).toBeInTheDocument()
    act(() => {
      jest.spyOn(player, 'currentTime').mockReturnValue(50)
      // event needs to be triggered manually because of jsdom limitations
      player.trigger('timeupdate')
    })
    await waitFor(() => {
      expect(screen.getByText('player.currentTime: 0:50')).toBeInTheDocument()
      expect(screen.getByText('player.progress: 50')).toBeInTheDocument()
    })
  })

  it('updates volume on volumechange', async () => {
    jest.spyOn(player, 'volume').mockReturnValue(0)

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
          <PlayerProvider initialState={{ volume: 0, mute: false }}>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(screen.getByText('player.volume: 0')).toBeInTheDocument()
    act(() => {
      jest.spyOn(player, 'volume').mockReturnValue(0.5)
      // event needs to be triggered manually because of jsdom limitations
      player.trigger('volumechange')
    })
    await waitFor(() => {
      expect(screen.getByText('player.volume: 50')).toBeInTheDocument()
      expect(screen.getByText('player.mute: false')).toBeInTheDocument()
    })
  })

  it('updates active state on useractive and userinactive', async () => {
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
          <PlayerProvider initialState={{ active: false }}>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(screen.getByText('player.active: false')).toBeInTheDocument()
    act(() => {
      player.trigger('useractive')
    })
    await waitFor(() => {
      expect(screen.getByText('player.active: true')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('userinactive')
    })
    await waitFor(() => {
      expect(screen.getByText('player.active: false')).toBeInTheDocument()
    })
  })

  it('updates loading state on player events', async () => {
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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    expect(screen.getByText('player.loading: false')).toBeInTheDocument()
    act(() => {
      player.trigger('waiting')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: true')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('playing')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: false')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('waiting')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: true')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('canplay')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: false')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('waiting')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: true')).toBeInTheDocument()
    })
    act(() => {
      player.trigger('canplaythrough')
    })
    await waitFor(() => {
      expect(screen.getByText('player.loading: false')).toBeInTheDocument()
    })
  })

  it('sets duration from player if variant duration not available', async () => {
    const videoWithoutDuration = {
      ...videos[0],
      variant:
        videos[0].variant != null ? { ...videos[0].variant, duration: 0 } : null
    }
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
            <VideoProvider value={{ content: videoWithoutDuration }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )

    act(() => {
      player.trigger('durationchange')
    })

    await waitFor(() => {
      expect(
        screen.getByText('player.durationSeconds: 250')
      ).toBeInTheDocument()
      expect(screen.getByText('player.duration: 4:10')).toBeInTheDocument()
    })
  })

  it('seeks video on slider change', async () => {
    jest.spyOn(player, 'currentTime')
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
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    const slider = screen.getByRole('slider', {
      name: 'desktop-progress-control'
    })
    fireEvent.change(slider, { target: { value: 100 } })

    await waitFor(() => {
      expect(screen.getByText('player.progress: 100')).toBeInTheDocument()
      expect(player.currentTime).toHaveBeenCalledWith(100)
    })
  })

  it('sets volume on slider change', async () => {
    jest.spyOn(player, 'volume')
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
          <PlayerProvider initialState={{ mute: false }}>
            <VideoProvider value={{ content: videos[0] }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    const slider = screen.getByRole('slider', { name: 'volume-control' })
    fireEvent.change(slider, { target: { value: 75 } })

    await waitFor(() => {
      expect(screen.getByText('player.volume: 75')).toBeInTheDocument()
      expect(player.volume).toHaveBeenCalledWith(0.75)
    })
  })

  it('updates progress percent not yet emitted', async () => {
    jest.spyOn(player, 'currentTime').mockReturnValue(26) // > 10% of 250

    const testVideo = {
      ...videos[0],
      variant: {
        ...videos[0].variant,
        duration: 250
      }
    }
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
            <VideoProvider value={{ content: testVideo as VideoContentFields }}>
              <VideoControls player={player} />
              <TestPlayerState />
            </VideoProvider>
          </PlayerProvider>
        </WatchProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByText('player.durationSeconds: 250')
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText('player.progressPercentNotYetEmitted: 10,25,50,75,90')
    ).toBeInTheDocument()

    act(() => {
      player.trigger('timeupdate')
    })

    await waitFor(() => {
      expect(
        screen.getByText('player.progressPercentNotYetEmitted: 25,50,75,90')
      ).toBeInTheDocument()
    })
  })
})
