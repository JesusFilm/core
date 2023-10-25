import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor
} from '@testing-library/react'
import fscreen from 'fscreen'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoControls } from './VideoControls'

describe('VideoControls', () => {
  let player: Player

  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      ...defaultVideoJsOptions,
      autoplay: true,
      controls: false,
      controlBar: false,
      bigPlayButton: false,
      fill: true,
      userActions: {
        hotkeys: true,
        doubleClick: true
      },
      responsive: true,
      muted: false,
      loop: true
    })
    act(() => {
      player.duration(250)
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('plays the video via video region click', async () => {
    const playStub = jest
      .spyOn(player, 'play')
      .mockImplementationOnce(async () => {
        void jest.fn()
      })

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('region', { name: 'video-controls' }))
    await waitFor(() => expect(playStub).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'center-pause-button' })
      ).toBeInTheDocument()
    )
  })

  it('plays the video via control bar play button', async () => {
    const playStub = jest
      .spyOn(player, 'play')
      .mockImplementationOnce(async () => {
        void jest.fn()
      })

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'bar-play-button' }))
    await waitFor(() => expect(playStub).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'bar-pause-button' })
      ).toBeInTheDocument()
    )
  })

  it('pauses the video via video region click', async () => {
    jest.spyOn(player, 'on').mockImplementation((type, fn) => {
      if (type === 'play') fn()
    })

    const pauseStub = jest
      .spyOn(player, 'pause')
      .mockImplementationOnce(() => player)

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('region', { name: 'video-controls' }))
    await waitFor(() => expect(pauseStub).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'center-play-button' })
      ).toBeInTheDocument()
    )
  })

  it('pauses the video via control bar pause button', async () => {
    jest.spyOn(player, 'on').mockImplementation((type, fn) => {
      if (type === 'play') fn()
    })

    const pauseStub = jest
      .spyOn(player, 'pause')
      .mockImplementationOnce(() => player)
    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'bar-pause-button' }))
    await waitFor(() => expect(pauseStub).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'bar-play-button' })
      ).toBeInTheDocument()
    )
  })

  it('mutes and unmutes the video on mute icon click', () => {
    const muteStub = jest
      .spyOn(player, 'muted')
      .mockImplementationOnce(() => !player.muted())

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'mute' }))
    expect(muteStub).toHaveBeenCalled()
    expect(muteStub).toHaveReturnedWith(true)
    fireEvent.click(getByRole('button', { name: 'mute' }))
    expect(muteStub).toHaveBeenCalled()
    expect(muteStub).toHaveReturnedWith(false)
  })

  describe('fullscreen video', () => {
    it('maximises the video on video region double tap', async () => {
      const fullscreenStub = jest
        .spyOn(player, 'requestFullscreen')
        .mockImplementationOnce(async () => player)

      const { getByRole } = render(
        <MockedProvider>
          <VideoControls player={player} startAt={0} endAt={10} />
        </MockedProvider>
      )

      expect(
        getByRole('region', { name: 'video-controls' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('region', { name: 'video-controls' }))
      fireEvent.click(getByRole('region', { name: 'video-controls' }))
      await waitFor(() => expect(fullscreenStub).toHaveBeenCalled())
    })

    it('minimises the video on video region double tap', async () => {
      jest.spyOn(player, 'isFullscreen').mockImplementation(() => true)
      const fullscreenStub = jest
        .spyOn(player, 'exitFullscreen')
        .mockImplementationOnce(async () => player)

      const { getByRole } = render(
        <MockedProvider>
          <VideoControls player={player} startAt={0} endAt={10} />
        </MockedProvider>
      )

      expect(
        getByRole('region', { name: 'video-controls' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('region', { name: 'video-controls' }))
      fireEvent.click(getByRole('region', { name: 'video-controls' }))
      await waitFor(() => expect(fullscreenStub).toHaveBeenCalled())
    })

    it('maximises the video on fullscreen icon click', async () => {
      jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone')
      const fullscreenStub = jest
        .spyOn(player, 'requestFullscreen')
        .mockImplementationOnce(async () => player)

      const { getByRole } = render(
        <MockedProvider>
          <VideoControls player={player} startAt={0} endAt={10} />
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'fullscreen' }))
      expect(fullscreenStub).toHaveBeenCalled()
    })

    it('minimises the video on fullscreen icon click', async () => {
      jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone')
      jest.spyOn(player, 'isFullscreen').mockImplementation(() => true)
      const fullscreenStub = jest
        .spyOn(player, 'exitFullscreen')
        .mockImplementationOnce(async () => player)

      const { getByRole } = render(
        <MockedProvider>
          <VideoControls player={player} startAt={0} endAt={10} />
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'fullscreen' }))
      expect(fullscreenStub).toHaveBeenCalled()
    })
  })

  describe('fullscreen card', () => {
    beforeEach(() => {
      jest
        .spyOn(fscreen, 'fullscreenEnabled', 'get')
        .mockImplementation(() => true)
      jest
        .spyOn(fscreen, 'requestFullscreen')
        .mockImplementation(() => jest.fn())
    })

    it('maximises the entire card on fullscreen icon click', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <div className="step swiper-slide-active">
            <div className="card MuiPaper-root">
              <VideoControls player={player} startAt={0} endAt={10} />
            </div>
          </div>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'fullscreen' }))
      await waitFor(() => expect(fscreen.requestFullscreen).toHaveBeenCalled())
    })

    it('minimises the entire card on fullscreen icon click', async () => {
      jest.spyOn(player, 'isFullscreen').mockImplementation(() => true)
      const exitMock = jest
        // @ts-expect-error: jest mock type conflicts with fscreen type
        .spyOn(fscreen, 'exitFullscreen', 'get')
        // @ts-expect-error: jest mock type conflicts with fscreen type
        .mockImplementation(() => jest.fn())

      const { getByRole } = render(
        <MockedProvider>
          <VideoControls player={player} startAt={0} endAt={10} />
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'fullscreen' }))
      await waitFor(() => expect(exitMock).toHaveBeenCalled())
    })
  })
})
