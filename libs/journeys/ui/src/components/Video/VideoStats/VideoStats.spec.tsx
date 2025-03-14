import videojs from '@mux/videojs-kit'
import { render, screen } from '@testing-library/react'
import '@mux/videojs-kit/dist/index.css'

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
  formatTimeRanges: () => '0:00-1:00'
}))

jest.mock('../utils/videoStatsUtils/isHtml5Tech', () => ({
  isHtml5Tech: jest.fn()
}))

jest.mock('../utils/videoStatsUtils/isYoutubeTech', () => ({
  isYoutubeTech: jest.fn()
}))

jest.mock('../utils/videoStatsUtils/getHtml5Stats', () => ({
  getHtml5Stats: jest.fn()
}))

jest.mock('../utils/videoStatsUtils/getYoutubeStats', () => ({
  getYoutubeStats: jest.fn()
}))

// Import the mocked functions after mocking
const { isHtml5Tech } = jest.requireMock('../utils/videoStatsUtils/isHtml5Tech')
const { isYoutubeTech } = jest.requireMock(
  '../utils/videoStatsUtils/isYoutubeTech'
)
const { getHtml5Stats } = jest.requireMock(
  '../utils/videoStatsUtils/getHtml5Stats'
)
const { getYoutubeStats } = jest.requireMock(
  '../utils/videoStatsUtils/getYoutubeStats'
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

  it('should render basic stats correctly', () => {
    // Mock tech to return unknown tech type
    jest.spyOn(player, 'tech').mockReturnValue({
      name_: 'Unknown'
    } as any)

    // Set up mocks for tech type checks
    isHtml5Tech.mockReturnValue(false)
    isYoutubeTech.mockReturnValue(false)

    render(<VideoStats player={player} />)

    // Check if basic stats are rendered correctly
    expect(screen.getByText('Player Stats')).toBeInTheDocument()
    expect(screen.getByText('Basic Info')).toBeInTheDocument()
    expect(screen.getByText('Current Time: 0:30')).toBeInTheDocument()
    expect(screen.getByText('Duration: 2:00')).toBeInTheDocument()
    expect(screen.getByText('Buffered: 0:00-1:00')).toBeInTheDocument()
    expect(screen.getByText('Seekable: 0:00-1:00')).toBeInTheDocument()
  })

  it('should render HTML5 enhanced stats correctly', () => {
    // Mock isHtml5Tech to return true
    isHtml5Tech.mockReturnValue(true)
    isYoutubeTech.mockReturnValue(false)

    // Mock getHtml5Stats to return test data
    getHtml5Stats.mockReturnValue({
      measuredBitrate: 1500,
      currentQuality: '720p',
      currentFrameRate: 30
    })

    render(<VideoStats player={player} />)

    expect(screen.getByText('Enhanced Info')).toBeInTheDocument()
    expect(screen.getByText('Current Quality: 720p')).toBeInTheDocument()
    expect(screen.getByText('Frame Rate: 30fps')).toBeInTheDocument()
    expect(screen.getByText('Bitrate: 1500 kbps')).toBeInTheDocument()
  })

  it('should render YouTube enhanced stats correctly', () => {
    isYoutubeTech.mockReturnValue(true)
    isHtml5Tech.mockReturnValue(false)

    jest.spyOn(player, 'tech').mockReturnValue({
      name_: 'Youtube'
    } as any)

    getYoutubeStats.mockReturnValue({
      currentQuality: 'hd720',
      bufferedPercent: 75
    })

    render(<VideoStats player={player} />)

    expect(screen.getByText('Enhanced Info')).toBeInTheDocument()
    expect(screen.getByText('Current Quality: hd720')).toBeInTheDocument()
    expect(screen.getByText('Buffered: 75%')).toBeInTheDocument()
  })

  it('should update stats when player time updates', () => {
    // Mock isHtml5Tech to return true
    isHtml5Tech.mockReturnValue(true)
    isYoutubeTech.mockReturnValue(false)

    // Mock getHtml5Stats to return test data
    getHtml5Stats.mockReturnValue({
      measuredBitrate: 1500,
      currentQuality: '720p',
      currentFrameRate: 30
    })

    render(<VideoStats player={player} />)

    // Simulate timeupdate event
    player.trigger('timeupdate')

    // Verify that stats are updated
    expect(screen.getByText('Current Time: 0:30')).toBeInTheDocument()
    expect(screen.getByText('Current Quality: 720p')).toBeInTheDocument()
  })

  it('should clean up event listeners on unmount', () => {
    // Spy on player.off method
    const offSpy = jest.spyOn(player, 'off')

    const { unmount } = render(<VideoStats player={player} />)

    // Unmount component
    unmount()

    // Verify that event listener is removed
    expect(offSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
  })
})
