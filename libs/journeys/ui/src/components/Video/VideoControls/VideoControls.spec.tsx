import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor
} from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import { MockedProvider } from '@apollo/client/testing'
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
  let player: Player
  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
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

  it('maximises and the video on video region double tap', async () => {
    const fullscreenStub = jest
      .spyOn(player, 'requestFullscreen')
      .mockImplementationOnce(async () => player)

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    expect(getByRole('region', { name: 'video-controls' })).toBeInTheDocument()

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

    expect(getByRole('region', { name: 'video-controls' })).toBeInTheDocument()

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

  it('maximises the card on fullscreen icon click', async () => {
    const fullscreenStub = jest
      .spyOn(player, 'requestFullscreen')
      .mockImplementationOnce(async () => player)

    const { getByRole } = render(
      <MockedProvider>
        <VideoControls player={player} startAt={0} endAt={10} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'fullscreen' }))
    await waitFor(() => expect(fullscreenStub).toHaveBeenCalled())
  })

  it('minimises the card on fullscreen icon click', async () => {
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
    await waitFor(() => expect(fullscreenStub).toHaveBeenCalled())
  })
})
