import Mux from '@mux/mux-node'
import { mockDeep } from 'jest-mock-extended'

import { getClient, getVideo } from '../services'

import { createGeneratedSubtitlesByAssetId, getSubtitleTrack } from './service'

// Mock the services
jest.mock('../services', () => ({
  getClient: jest.fn(),
  getVideo: jest.fn()
}))

const mockMux = mockDeep<Mux>()
const mockGetClient = jest.mocked(getClient)
const mockGetVideo = jest.mocked(getVideo)

// Mock @mux/mux-node
jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => mockMux)
}))

describe('MuxSubtitlesService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createGeneratedSubtitlesByAssetId', () => {
    it('should successfully create generated subtitles when audio track is found', async () => {
      const mockAudioTrack = {
        id: 'audio-track-123',
        type: 'audio',
        language_code: 'en-US'
      }
      const mockAsset = {
        tracks: [mockAudioTrack]
      }
      const mockSubtitleResponse = {
        generated_subtitles: [
          {
            id: 'subtitle-123',
            language_code: 'en-US',
            name: 'English',
            status: 'ready'
          }
        ]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)
      mockGetClient.mockReturnValue(mockMux)
      mockMux.video.assets.generateSubtitles.mockResolvedValue(
        mockSubtitleResponse as any
      )

      const result = await createGeneratedSubtitlesByAssetId(
        false,
        'asset-123',
        'en-US',
        'English'
      )

      expect(mockGetVideo).toHaveBeenCalledWith('asset-123', false)
      expect(mockMux.video.assets.generateSubtitles).toHaveBeenCalledWith(
        'asset-123',
        'audio-track-123',
        {
          generated_subtitles: [
            {
              language_code: 'en-US',
              name: 'English'
            }
          ]
        }
      )
      expect(result).toEqual(mockSubtitleResponse)
    })

    it('should throw error when audio track is not found', async () => {
      const mockAsset = {
        tracks: [
          {
            id: 'track-123',
            type: 'video',
            language_code: 'en-US'
          }
        ]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      await expect(
        createGeneratedSubtitlesByAssetId(
          false,
          'asset-123',
          'en-US',
          'English'
        )
      ).rejects.toThrow('Audio track not found')
    })

    it('should throw error when audio track exists but has no id', async () => {
      const mockAudioTrack = {
        type: 'audio',
        language_code: 'en-US'
        // Missing id
      }
      const mockAsset = {
        tracks: [mockAudioTrack]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      await expect(
        createGeneratedSubtitlesByAssetId(
          false,
          'asset-123',
          'en-US',
          'English'
        )
      ).rejects.toThrow('Audio track not found')
    })

    it('should find correct audio track when multiple audio tracks exist', async () => {
      const mockAudioTracks = [
        {
          id: 'audio-track-1',
          type: 'audio',
          language_code: 'en-US'
        },
        {
          id: 'audio-track-2',
          type: 'audio',
          language_code: 'es-ES'
        }
      ]
      const mockAsset = {
        tracks: mockAudioTracks
      }
      const mockSubtitleResponse = {
        generated_subtitles: [
          {
            id: 'subtitle-123',
            language_code: 'es-ES',
            name: 'Español',
            status: 'ready'
          }
        ]
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)
      mockGetClient.mockReturnValue(mockMux)
      mockMux.video.assets.generateSubtitles.mockResolvedValue(
        mockSubtitleResponse as any
      )

      await createGeneratedSubtitlesByAssetId(
        false,
        'asset-123',
        'es-ES',
        'Español'
      )

      expect(mockMux.video.assets.generateSubtitles).toHaveBeenCalledWith(
        'asset-123',
        'audio-track-2',
        {
          generated_subtitles: [
            {
              language_code: 'es-ES',
              name: 'Español'
            }
          ]
        }
      )
    })
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

    it('should return null when tracks array is undefined', async () => {
      const mockAsset = {
        tracks: undefined
      }

      mockGetVideo.mockResolvedValue(mockAsset as any)

      const result = await getSubtitleTrack('asset-123', 'track-123', false)

      expect(result).toBeNull()
    })
  })
})
