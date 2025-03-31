import { fireEvent, render, screen } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { useVideo } from '../../../../libs/videoContext'

import { ContainerHero } from './ContainerHero'

jest.mock('../../../../libs/videoContext', () => ({
  useVideo: jest.fn()
}))

const mockVideoData = {
  id: 'video-123',
  __typename: 'Video',
  label: VideoLabel.series,
  title: [{ value: 'Easter Collection', __typename: 'VideoTitle' }],
  childrenCount: 5,
  images: [],
  imageAlt: [],
  snippet: [],
  description: [],
  studyQuestions: [],
  variant: null,
  variantLanguagesCount: 0,
  slug: 'easter-collection'
}

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn()
  })
}))

jest.mock('video.js', () => {
  const originalModule = jest.requireActual('video.js')

  const mockPlayer = {
    on: jest.fn(),
    play: jest.fn().mockReturnValue(Promise.resolve()),
    pause: jest.fn(),
    muted: jest.fn(),
    currentTime: jest.fn(),
    dispose: jest.fn()
  }

  const mockVideoJs = jest.fn(() => mockPlayer)

  return {
    ...originalModule,
    __esModule: true,
    default: mockVideoJs
  }
})

const mockVideoJs = videojs as jest.MockedFunction<typeof videojs>

// Mock the ContainerHeroMuteButton to have English aria-labels for testing
jest.mock('../../ContainerHeroMuteButton', () => ({
  ContainerHeroMuteButton: ({ isMuted, onClick }) => (
    <button
      onClick={onClick}
      className="p-3 rounded-full bg-black/50 text-white ml-4 -mb-3 mr-1 transition-colors hover:bg-black/70"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg data-testid="UnmuteIcon" />
      ) : (
        <svg data-testid="MuteIcon" />
      )}
    </button>
  )
}))

describe('ContainerHero', () => {
  let mockPlayer: Partial<Player>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useVideo as jest.Mock).mockReturnValue(mockVideoData)

    mockPlayer = {
      on: jest.fn(),
      play: jest.fn().mockReturnValue(Promise.resolve()),
      pause: jest.fn(),
      muted: jest.fn(),
      currentTime: jest.fn(),
      dispose: jest.fn()
    }
    mockVideoJs.mockImplementation(() => mockPlayer as Player)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the muted button with correct state and icon', () => {
    render(<ContainerHero />)

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeInTheDocument()

    const unmuteIcon = screen.getByTestId('UnmuteIcon')
    expect(unmuteIcon).toBeInTheDocument()
  })

  it('renders the video component', () => {
    render(<ContainerHero />)

    const videoComponent = screen.getByTestId('ContainerHeroVideo')
    expect(videoComponent).toBeInTheDocument()
  })

  it('should toggle mute state when the mute button is clicked', () => {
    mockPlayer.muted = jest.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return true
    })

    render(<ContainerHero />)

    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unmute' }))

    expect(mockPlayer.muted).toHaveBeenCalledWith(false)

    mockPlayer.muted = jest.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return false
    })

    render(<ContainerHero />)

    const muteButton = screen.getByRole('button', { name: 'Mute' })
    fireEvent.click(muteButton)

    expect(mockPlayer.muted).toHaveBeenCalledWith(true)
  })

  it('should properly initialize the player and set the player reference', () => {
    mockPlayer.muted = jest.fn().mockReturnValue(true)

    render(<ContainerHero />)

    expect(mockVideoJs).toHaveBeenCalled()

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeInTheDocument()

    expect(mockPlayer.on).toHaveBeenCalled()
  })

  it('should restart the video when unmuting for the first time', () => {
    mockPlayer.muted = jest.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return true
    })

    render(<ContainerHero />)

    const unmuteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(unmuteButton).toBeInTheDocument()

    fireEvent.click(unmuteButton)

    expect(mockPlayer.muted).toHaveBeenCalledWith(false)
    expect(mockPlayer.currentTime).toHaveBeenCalledWith(0)
    expect(mockPlayer.play).toHaveBeenCalled()
  })

  it('should handle player ready callback', () => {
    render(<ContainerHero />)

    expect(mockVideoJs).toHaveBeenCalled()

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    fireEvent.click(muteButton)

    expect(mockPlayer.muted).toHaveBeenCalled()
  })
})
