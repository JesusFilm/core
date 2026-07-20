import { render, screen } from '@testing-library/react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import VideoJsPlayer from '../utils/videoJsTypes'
import { formatTimeRanges } from '../utils/videoStatsUtils/formatTimeRanges'
import { getCurrentQuality as _getCurrentQuality } from '../utils/videoStatsUtils/getCurrentQuality'

import { VideoStats } from './VideoStats'

// Mock the translation function
vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// Mock the individual modules
vi.mock('../utils/videoStatsUtils/formatTime', () => ({
  formatTime: (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}))

vi.mock('../utils/videoStatsUtils/formatTimeRanges', () => ({
  formatTimeRanges: vi
    .fn<(...args: unknown[]) => string>()
    .mockReturnValue('0:00-1:00')
}))

vi.mock('../utils/videoStatsUtils/getCurrentQuality', () => ({
  getCurrentQuality: vi.fn().mockReturnValue('720p')
}))

const getCurrentQuality = vi.mocked(_getCurrentQuality)

describe('VideoStats', () => {
  let player: VideoJsPlayer

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create a video element and initialize videojs player
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      ...defaultVideoJsOptions,
      autoplay: false,
      controls: true
    }) as VideoJsPlayer

    // Mock the player methods
    vi.spyOn(player, 'currentTime').mockReturnValue(30)
    vi.spyOn(player, 'duration').mockReturnValue(120)

    // Mock buffered and seekable timeRanges
    const mockTimeRanges = {
      length: 1,
      start: vi.fn().mockReturnValue(0),
      end: vi.fn().mockReturnValue(60)
    } as unknown as TimeRanges

    vi.spyOn(player, 'buffered').mockReturnValue(mockTimeRanges)
    vi.spyOn(player, 'seekable').mockReturnValue(mockTimeRanges)
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
    const offSpy = vi.spyOn(player, 'off')

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
    vi.mocked(formatTimeRanges).mockImplementation(
      (timeRanges, startAt, endAt) => {
        if (startAt === 30 && endAt === 90) {
          return '0:00-0:30' // Adjusted for trimming
        }
        return '0:00-1:00' // Default
      }
    )

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
