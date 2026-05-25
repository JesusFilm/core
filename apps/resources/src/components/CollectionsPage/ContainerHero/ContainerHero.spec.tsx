import { fireEvent, render, screen } from '@testing-library/react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import type { Mock, MockedFunction } from 'vitest'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { useVideo } from '../../../libs/videoContext'

import { ContainerHero, ContainerHeroProps } from './ContainerHero'

vi.mock('../../../libs/videoContext', async () => ({
  useVideo: vi.fn()
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

vi.mock('next-i18next/pages', async () => ({
  ...(await vi.importActual<typeof import('next-i18next/pages')>(
    'next-i18next/pages'
  )),
  useTranslation: vi.fn().mockReturnValue({
    t: vi.fn()
  })
}))

vi.mock('video.js', async () => {
  const originalModule =
    await vi.importActual<typeof import('video.js')>('video.js')

  const mockPlayer = {
    on: vi.fn(),
    play: vi.fn().mockReturnValue(Promise.resolve()),
    pause: vi.fn(),
    muted: vi.fn(),
    currentTime: vi.fn(),
    dispose: vi.fn(),
    src: vi.fn()
  }

  const mockVideoJs = vi.fn(() => mockPlayer)

  return {
    ...originalModule,
    __esModule: true,
    default: mockVideoJs
  }
})

const mockVideoJs = videojs as MockedFunction<typeof videojs>

// Mock the ContainerHeroMuteButton to have English aria-labels for testing
vi.mock('./ContainerHeroMuteButton', async () => ({
  ContainerHeroMuteButton: ({ isMuted, onClick }) => (
    <button
      onClick={onClick}
      className="mr-1 -mb-3 ml-4 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
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
  const defaultProps: ContainerHeroProps = {
    title: 'Easter',
    descriptionBeforeYear: 'Easter',
    descriptionAfterYear:
      'videos & resources about Lent, Holy Week, Resurrection',
    feedbackButtonLabel: 'Feedback',
    year: 2026
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useVideo as Mock).mockReturnValue(mockVideoData)

    mockPlayer = {
      on: vi.fn(),
      play: vi.fn().mockReturnValue(Promise.resolve()),
      pause: vi.fn(),
      muted: vi.fn(),
      currentTime: vi.fn(),
      dispose: vi.fn(),
      src: vi.fn()
    }
    mockVideoJs.mockImplementation(() => mockPlayer as Player)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the muted button with correct state and icon', () => {
    render(<ContainerHero {...defaultProps} />)

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeInTheDocument()

    const unmuteIcon = screen.getByTestId('UnmuteIcon')
    expect(unmuteIcon).toBeInTheDocument()
  })

  it('renders the video component', () => {
    render(<ContainerHero {...defaultProps} />)

    const videoComponent = screen.getByTestId('ContainerHeroVideo')
    expect(videoComponent).toBeInTheDocument()
  })

  it('renders the correct title, collection details, and description', () => {
    render(<ContainerHero {...defaultProps} />)

    expect(screen.getByText('Easter')).toBeInTheDocument()

    const expectedDescription =
      'Easter 2026 videos & resources about Lent, Holy Week, Resurrection'
    expect(screen.getByTestId('ContainerHeroDescription')).toHaveTextContent(
      expectedDescription
    )
  })

  it('should toggle mute state when the mute button is clicked', () => {
    mockPlayer.muted = vi.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return true
    })

    render(<ContainerHero {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unmute' }))

    expect(mockPlayer.muted).toHaveBeenCalledWith(false)

    mockPlayer.muted = vi.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return false
    })

    render(<ContainerHero {...defaultProps} />)

    const muteButton = screen.getByRole('button', { name: 'Mute' })
    fireEvent.click(muteButton)

    expect(mockPlayer.muted).toHaveBeenCalledWith(true)
  })

  it('should properly initialize the player and set the player reference', () => {
    mockPlayer.muted = vi.fn().mockReturnValue(true)

    render(<ContainerHero {...defaultProps} />)

    expect(mockVideoJs).toHaveBeenCalled()

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(muteButton).toBeInTheDocument()

    expect(mockPlayer.on).toHaveBeenCalled()
  })

  it('should restart the video when unmuting for the first time', () => {
    mockPlayer.muted = vi.fn().mockImplementation((state?: boolean) => {
      if (state !== undefined) {
        return state
      }
      return true
    })

    render(<ContainerHero {...defaultProps} />)

    const unmuteButton = screen.getByRole('button', { name: 'Unmute' })
    expect(unmuteButton).toBeInTheDocument()

    fireEvent.click(unmuteButton)

    expect(mockPlayer.muted).toHaveBeenCalledWith(false)
    expect(mockPlayer.currentTime).toHaveBeenCalledWith(0)
    expect(mockPlayer.play).toHaveBeenCalled()
  })

  it('should handle player ready callback', () => {
    render(<ContainerHero {...defaultProps} />)

    expect(mockVideoJs).toHaveBeenCalled()

    const muteButton = screen.getByRole('button', { name: 'Unmute' })
    fireEvent.click(muteButton)

    expect(mockPlayer.muted).toHaveBeenCalled()
  })
})
