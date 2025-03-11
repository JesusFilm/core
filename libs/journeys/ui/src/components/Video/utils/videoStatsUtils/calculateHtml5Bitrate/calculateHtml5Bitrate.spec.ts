import VideoJsPlayer from '../../../utils/videoJsTypes'
import { Html5 } from '../../../utils/videoJsTypes/Html5'

import { calculateHtml5Bitrate } from './calculateHtml5Bitrate'

// Mock the isHtml5Tech function
jest.mock('../isHtml5Tech', () => ({
  isHtml5Tech: (tech: any) => tech != null && 'vhs' in tech
}))

describe('calculateHtml5Bitrate', () => {
  let mockPlayer: VideoJsPlayer
  let mockTech: Html5
  let mockVhs: Html5['vhs']

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock objects
    mockVhs = {
      stats: {
        mediaBytesTransferred: 0,
        mediaRequests: 0,
        mediaRequestsAborted: 0,
        mediaTransferDuration: 0,
        bandwidth: 0
      },
      bandwidth: 0
    }

    mockTech = {
      name_: 'Html5',
      vhs: mockVhs
    } as unknown as Html5

    mockPlayer = {
      tech: jest.fn().mockReturnValue(mockTech)
    } as unknown as VideoJsPlayer
  })

  it('should return 0 if player is not provided', () => {
    expect(calculateHtml5Bitrate(undefined as unknown as VideoJsPlayer)).toBe(0)
  })

  it('should return 0 if tech is not Html5', () => {
    // Change the tech name to make isHtml5Tech return false
    ;(mockTech as any).name_ = 'Youtube'

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(0)
    expect(mockPlayer.tech).toHaveBeenCalledWith({
      IWillNotUseThisInPlugins: true
    })
  })

  it('should return 0 if vhs is not available', () => {
    // Set vhs to undefined
    ;(mockTech as any).vhs = undefined

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(0)
  })

  it('should calculate bitrate from media segments when stats are available', () => {
    // Set up mock stats
    mockVhs.stats = {
      mediaBytesTransferred: 10000000, // 10MB
      mediaRequests: 10,
      mediaRequestsAborted: 0,
      mediaTransferDuration: 5000, // 5 seconds
      bandwidth: 1000 // Fallback value
    }

    // Expected calculation:
    // bytesPerSegment = 10000000 / 10 = 1000000
    // transferDurationSec = 5000 / 1000 = 5
    // bitrate = (1000000 * 8) / 5 / 1000 = 1600 kbps

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(1600)
  })

  it('should handle mediaRequestsAborted when calculating bitrate', () => {
    // Set up mock stats with aborted requests
    mockVhs.stats = {
      mediaBytesTransferred: 10000000, // 10MB
      mediaRequests: 10,
      mediaRequestsAborted: 5, // 5 aborted requests
      mediaTransferDuration: 5000, // 5 seconds
      bandwidth: 1000 // Fallback value
    }

    // Expected calculation:
    // mediaRequests = max(1, 10 - 5) = 5
    // bytesPerSegment = 10000000 / 5 = 2000000
    // transferDurationSec = 5000 / 1000 = 5
    // bitrate = (2000000 * 8) / 5 / 1000 = 3200 kbps

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(3200)
  })

  it('should fall back to bandwidth if segment calculation is not available', () => {
    // Set up mock with no segment stats but with bandwidth
    mockVhs.stats = undefined
    mockVhs.bandwidth = 2500

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(2500)
  })

  it('should fall back to bandwidth if calculated bitrate is 0', () => {
    // Set up mock with invalid segment stats
    mockVhs.stats = {
      mediaBytesTransferred: 0,
      mediaRequests: 10,
      mediaTransferDuration: 5000
    }
    mockVhs.bandwidth = 3000

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(3000)
  })

  it('should return 0 if no bitrate information is available', () => {
    // Set up mock with no stats and no bandwidth
    mockVhs.stats = undefined
    mockVhs.bandwidth = 0

    expect(calculateHtml5Bitrate(mockPlayer)).toBe(0)
  })

  it('should handle zero transfer duration', () => {
    // Set up mock with zero transfer duration
    mockVhs.stats = {
      mediaBytesTransferred: 10000000,
      mediaRequests: 10,
      mediaTransferDuration: 0
    }
    mockVhs.bandwidth = 4000

    // Should fall back to bandwidth
    expect(calculateHtml5Bitrate(mockPlayer)).toBe(4000)
  })
})
