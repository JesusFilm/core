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

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoProvider } from '../../../../../libs/videoContext'
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

jest.mock('../../../../../libs/cookieHandler', () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn()
}))

const mockDispatch = jest.fn()
jest.mock('../../../../../libs/watchContext', () => ({
  ...jest.requireActual('../../../../../libs/watchContext'),
  useWatch: jest.fn(() => ({
    state: {
      siteLanguage: 'en',
      audioLanguage: '529',
      subtitleLanguage: '529',
      subtitleOn: false
    },
    dispatch: mockDispatch
  }))
}))

const mockSetCookie = jest.mocked(
  require('../../../../../libs/cookieHandler').setCookie
)
const mockGetCookie = jest.mocked(
  require('../../../../../libs/cookieHandler').getCookie
)

describe('VideoControls', () => {
  let player

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetCookie.mockClear()
    mockGetCookie.mockClear()
    mockDispatch.mockClear()

    // Set default return value for getCookie
    mockGetCookie.mockReturnValue('en')

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
    const { getAllByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getAllByTestId('PlayArrowRoundedIcon')[1])
    expect(playStub).toHaveBeenCalled()
  })

  it('pause the video', async () => {
    jest.spyOn(player, 'on').mockImplementation((label, fn: () => void) => {
      if (label === 'play') fn()
    })
    const pauseStub = jest.spyOn(player, 'pause').mockImplementation(() => ({
      pause: jest.fn()
    }))
    const { getAllByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getAllByTestId('PauseRoundedIcon')[1])
    expect(pauseStub).toHaveBeenCalled()
  })

  it('mutes the video on mute icon click', () => {
    const mutedStub = jest.spyOn(player, 'muted').mockImplementation(() => ({
      muted: jest.fn()
    }))
    const { getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('VolumeUpOutlinedIcon'))
    expect(mutedStub).toHaveBeenCalled()
  })

  it('opens audio language dialog on language button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('LanguageOutlinedIcon'))
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Language Settings' })
      ).toBeInTheDocument()
    )
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
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('FullscreenOutlinedIcon'))
    expect(fullscreenStub).toHaveBeenCalled()
  })

  it('fullscreens the video player on fullscreen icon click when desktop', async () => {
    ;(global.navigator.userAgent as unknown as string) = 'Mac'
    const { getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
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

  it('sets cookie, dispatches action, and opens dialog when subtitle button is clicked', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoControls player={player} />
        </VideoProvider>
      </MockedProvider>
    )

    // Click the subtitle button (SubtitlesOutlined icon) - using same pattern as other tests
    fireEvent.click(getByTestId('SubtitlesOutlinedIcon'))

    // Verify cookie was set
    expect(mockSetCookie).toHaveBeenCalledWith('SUBTITLES_ON', 'true')

    // Verify dispatch was called with correct action
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UpdateSubtitlesOn',
      enabled: true
    })

    // Verify dialog opens
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Language Settings' })
      ).toBeInTheDocument()
    )
  })
})
