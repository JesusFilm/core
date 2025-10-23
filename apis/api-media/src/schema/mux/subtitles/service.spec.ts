import { getVideo } from '../services'

import { getSubtitleTrack } from './service'

// Mock the services
jest.mock('../services', () => ({
  getVideo: jest.fn()
}))

const mockGetVideo = jest.mocked(getVideo)

describe('Subtitle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSubtitleTrack', () => {
    it('should return track when found', async () => {
      const mockTrack = {
        id: 'track-123',
        type: 'text',
        status: 'ready'
      }
      const mockAsset = {
        tracks: [mockTrack]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      const result = await getSubtitleTrack('asset-123', 'track-123', false)

      expect(result).toEqual(mockTrack)
    })

    it('should return null when track is not found', async () => {
      const mockAsset = {
        tracks: []
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      const result = await getSubtitleTrack('asset-123', 'track-123', false)

      expect(result).toBeNull()
    })

    it('should return null when track type is not text', async () => {
      const mockAsset = {
        tracks: [
          {
            id: 'track-123',
            type: 'audio',
            status: 'ready'
          }
        ]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      const result = await getSubtitleTrack('asset-123', 'track-123', false)

      expect(result).toBeNull()
    })
  })
})
