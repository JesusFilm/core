import { getVideo } from '../video/service'

import { getMuxTrackByBcp47 } from './service'

jest.mock('../video/service', () => ({
  getVideo: jest.fn()
}))

describe('MuxSubtitleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMuxTrackByBcp47', () => {
    it('should return track when found with matching bcp47', async () => {
      const mockTrack = {
        id: 'track-id',
        type: 'text',
        language_code: 'en',
        text_source: 'generated_vod',
        status: 'ready'
      }

      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [mockTrack]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBe(mockTrack)
    })

    it('should return track for user generated content', async () => {
      const mockTrack = {
        id: 'track-id',
        type: 'text',
        language_code: 'es',
        text_source: 'generated_vod',
        status: 'ready'
      }

      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [mockTrack]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'es', true)

      expect(getVideo).toHaveBeenCalledWith('asset-id', true)
      expect(result).toBe(mockTrack)
    })

    it('should return undefined when track is not found', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [
          {
            id: 'track-id',
            type: 'text',
            language_code: 'fr',
            text_source: 'generated_vod',
            status: 'ready'
          }
        ]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should return undefined when tracks array is empty', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: []
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should return undefined when tracks is null', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: null
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should return undefined when tracks is undefined', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id'
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should only match tracks with type text', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [
          {
            id: 'track-id',
            type: 'video',
            language_code: 'en',
            text_source: 'generated_vod',
            status: 'ready'
          }
        ]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should only match tracks with text_source generated_vod', async () => {
      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [
          {
            id: 'track-id',
            type: 'text',
            language_code: 'en',
            text_source: 'uploaded',
            status: 'ready'
          }
        ]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBeUndefined()
    })

    it('should find correct track when multiple tracks exist', async () => {
      const targetTrack = {
        id: 'target-track-id',
        type: 'text',
        language_code: 'en',
        text_source: 'generated_vod',
        status: 'ready'
      }

      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [
          {
            id: 'track-1',
            type: 'text',
            language_code: 'fr',
            text_source: 'generated_vod',
            status: 'ready'
          },
          targetTrack,
          {
            id: 'track-2',
            type: 'text',
            language_code: 'es',
            text_source: 'generated_vod',
            status: 'ready'
          },
          {
            id: 'track-3',
            type: 'video',
            language_code: 'en',
            text_source: 'generated_vod',
            status: 'ready'
          }
        ]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBe(targetTrack)
    })

    it('should handle different bcp47 language codes', async () => {
      const mockTracks = [
        {
          id: 'track-en',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        },
        {
          id: 'track-es',
          type: 'text',
          language_code: 'es',
          text_source: 'generated_vod',
          status: 'ready'
        },
        {
          id: 'track-fr',
          type: 'text',
          language_code: 'fr',
          text_source: 'generated_vod',
          status: 'ready'
        }
      ]

      ;(getVideo as jest.Mock).mockResolvedValue({
        id: 'asset-id',
        tracks: mockTracks
      })

      const resultEn = await getMuxTrackByBcp47('asset-id', 'en', false)
      expect(resultEn).toBe(mockTracks[0])

      const resultEs = await getMuxTrackByBcp47('asset-id', 'es', false)
      expect(resultEs).toBe(mockTracks[1])

      const resultFr = await getMuxTrackByBcp47('asset-id', 'fr', false)
      expect(resultFr).toBe(mockTracks[2])
    })

    it('should handle tracks with different statuses', async () => {
      const mockTrack = {
        id: 'track-id',
        type: 'text',
        language_code: 'en',
        text_source: 'generated_vod',
        status: 'preparing'
      }

      ;(getVideo as jest.Mock).mockResolvedValueOnce({
        id: 'asset-id',
        tracks: [mockTrack]
      })

      const result = await getMuxTrackByBcp47('asset-id', 'en', false)

      expect(getVideo).toHaveBeenCalledWith('asset-id', false)
      expect(result).toBe(mockTrack)
    })
  })
})
