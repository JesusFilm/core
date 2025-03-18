import { render, screen } from '@testing-library/react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import VideoJsPlayer from '../utils/videoJsTypes'

import { VideoStats } from './VideoStats'

// Mock the translation function
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// Mock the individual modules
jest.mock('../utils/videoStatsUtils/formatTime', () => ({
  formatTime: (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}))

jest.mock('../utils/videoStatsUtils/formatTimeRanges', () => ({
  formatTimeRanges: (
    timeRanges: TimeRanges | null | undefined,
    startAt: number,
    endAt: number
  ) => '0:00-1:00'
}))

jest.mock('../utils/videoStatsUtils/getCurrentQuality', () => ({
  getCurrentQuality: jest.fn().mockReturnValue('720p')
}))

// Import the mocked functions after mocking
const { getCurrentQuality } = jest.requireMock(
  '../utils/videoStatsUtils/getCurrentQuality'
)

describe('VideoStats', () => {
  let player: VideoJsPlayer

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create a video element and initialize videojs player
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      ...defaultVideoJsOptions,
      autoplay: false,
      controls: true
    }) as VideoJsPlayer

    // Mock the player methods
    jest.spyOn(player, 'currentTime').mockReturnValue(30)
    jest.spyOn(player, 'duration').mockReturnValue(120)

    // Mock buffered and seekable timeRanges
    const mockTimeRanges = {
      length: 1,
      start: jest.fn().mockReturnValue(0),
      end: jest.fn().mockReturnValue(60)
    } as unknown as TimeRanges

    jest.spyOn(player, 'buffered').mockReturnValue(mockTimeRanges)
    jest.spyOn(player, 'seekable').mockReturnValue(mockTimeRanges)
  })

  afterEach(() => {
    // Clean up player
    player.dispose()
  })

  it('should render stats correctly', () => {
    render(<VideoStats player={player} startAt={0} endAt={120} />)

    // Check if stats are rendered correctly
    expect(screen.getByText('Player Stats')).toBeInTheDocument()
    expect(screen.getByText('Current Time: 0:30')).toBeInTheDocument()
    expect(screen.getByText('Duration: 2:00')).toBeInTheDocument()
    expect(screen.getByText('Buffered: 0:00-1:00')).toBeInTheDocument()
    expect(screen.getByText('Seekable: 0:00-1:00')).toBeInTheDocument()
    expect(screen.getByText('Current Quality: 720p')).toBeInTheDocument()
  })

  it('should update stats when player time updates', () => {
    render(<VideoStats player={player} startAt={0} endAt={120} />)

    // Simulate timeupdate event
    player.trigger('timeupdate')

    // Verify that stats are updated
    expect(screen.getByText('Current Time: 0:30')).toBeInTheDocument()
    expect(getCurrentQuality).toHaveBeenCalled()
  })

  it('should clean up event listeners on unmount', () => {
    // Spy on player.off method
    const offSpy = jest.spyOn(player, 'off')

    const { unmount } = render(
      <VideoStats player={player} startAt={0} endAt={120} />
    )

    // Unmount component
    unmount()

    // Verify that event listener is removed
    expect(offSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
  })

  it('should adjust stats for trimmed videos', () => {
    // Mock formatTimeRanges to return different values based on parameters
    const formatTimeRangesMock = jest.requireMock(
      '../utils/videoStatsUtils/formatTimeRanges'
    )
    formatTimeRangesMock.formatTimeRanges = jest
      .fn()
      .mockImplementation((timeRanges, startAt, endAt) => {
        if (startAt === 30 && endAt === 90) {
          return '0:00-0:30' // Adjusted for trimming
        }
        return '0:00-1:00' // Default
      })

    // Render with trimming (startAt=30, endAt=90)
    render(<VideoStats player={player} startAt={30} endAt={90} />)

    // Current time should be adjusted (30 - 30 = 0)
    expect(screen.getByText('Current Time: 0:00')).toBeInTheDocument()

    // Duration should be calculated from startAt and endAt (90 - 30 = 60 seconds = 1:00)
    expect(screen.getByText('Duration: 1:00')).toBeInTheDocument()

    // Buffered and seekable should use the adjusted values from our mock
    expect(screen.getByText('Buffered: 0:00-0:30')).toBeInTheDocument()
    expect(screen.getByText('Seekable: 0:00-0:30')).toBeInTheDocument()
  })
})
