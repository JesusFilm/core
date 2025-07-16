import Mux from '@mux/mux-node'
import { mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  enableDownload,
  getStaticRenditions,
  getUpload,
  getVideo
} from './service'

const mockMux = mockDeep<Mux>()

jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => mockMux)
}))

describe('MuxVideoService', () => {
  const originalEnv = clone(process.env)
  const MockedMux = Mux as jest.MockedClass<typeof Mux>

  beforeEach(() => {
    process.env = originalEnv
    process.env.MUX_ACCESS_TOKEN_ID = 'mux_access_token'
    process.env.MUX_SECRET_KEY = 'mux_secret_key'
    process.env.MUX_UGC_ACCESS_TOKEN_ID = 'mux_ugc_access_token'
    process.env.MUX_UGC_SECRET_KEY = 'mux_ugc_secret_key'
    process.env.CORS_ORIGIN = 'https://example.com'
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('createVideoByDirectUpload', () => {
    it('should create direct upload for publisher (non-user generated)', async () => {
      mockMux.video.uploads.create.mockResolvedValueOnce({
        id: 'upload-id',
        url: 'https://upload.mux.com/video'
      } as any)

      const result = await createVideoByDirectUpload(false)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_access_token',
        tokenSecret: 'mux_secret_key'
      })
      expect(mockMux.video.uploads.create).toHaveBeenCalledWith({
        cors_origin: 'https://example.com',
        new_asset_settings: {
          encoding_tier: 'smart',
          playback_policy: ['public'],
          max_resolution_tier: undefined,
          static_renditions: []
        }
      })
      expect(result).toEqual({
        id: 'upload-id',
        uploadUrl: 'https://upload.mux.com/video'
      })
    })

    it('should create direct upload for user generated content', async () => {
      mockMux.video.uploads.create.mockResolvedValueOnce({
        id: 'ugc-upload-id',
        url: 'https://upload.mux.com/ugc-video'
      } as any)

      const result = await createVideoByDirectUpload(true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(result).toEqual({
        id: 'ugc-upload-id',
        uploadUrl: 'https://upload.mux.com/ugc-video'
      })
    })

    it('should create downloadable video when downloadable=true', async () => {
      mockMux.video.uploads.create.mockResolvedValueOnce({
        id: 'upload-id',
        url: 'https://upload.mux.com/video'
      } as any)

      await createVideoByDirectUpload(false, '1440p', true)

      expect(mockMux.video.uploads.create).toHaveBeenCalledWith({
        cors_origin: 'https://example.com',
        new_asset_settings: {
          encoding_tier: 'smart',
          playback_policy: ['public'],
          max_resolution_tier: '1440p',
          static_renditions: [
            { resolution: '270p' },
            { resolution: '360p' },
            { resolution: '480p' },
            { resolution: '720p' },
            { resolution: '1080p' },
            { resolution: '1440p' },
            { resolution: '2160p' }
          ]
        }
      })
    })

    it('should throw error when missing CORS_ORIGIN', async () => {
      delete process.env.CORS_ORIGIN
      await expect(createVideoByDirectUpload(false)).rejects.toThrow(
        'Missing CORS_ORIGIN'
      )
    })

    it('should throw error when missing MUX_ACCESS_TOKEN_ID for publisher', async () => {
      delete process.env.MUX_ACCESS_TOKEN_ID
      await expect(createVideoByDirectUpload(false)).rejects.toThrow(
        'Missing MUX_ACCESS_TOKEN_ID'
      )
    })

    it('should throw error when missing MUX_SECRET_KEY for publisher', async () => {
      delete process.env.MUX_SECRET_KEY
      await expect(createVideoByDirectUpload(false)).rejects.toThrow(
        'Missing MUX_SECRET_KEY'
      )
    })

    it('should throw error when missing MUX_UGC_ACCESS_TOKEN_ID for UGC', async () => {
      delete process.env.MUX_UGC_ACCESS_TOKEN_ID
      await expect(createVideoByDirectUpload(true)).rejects.toThrow(
        'Missing MUX_UGC_ACCESS_TOKEN_ID'
      )
    })

    it('should throw error when missing MUX_UGC_SECRET_KEY for UGC', async () => {
      delete process.env.MUX_UGC_SECRET_KEY
      await expect(createVideoByDirectUpload(true)).rejects.toThrow(
        'Missing MUX_UGC_SECRET_KEY'
      )
    })

    it('should throw error when Mux response is missing id', async () => {
      mockMux.video.uploads.create.mockResolvedValueOnce({
        url: 'https://upload.mux.com/video'
      } as any)

      await expect(createVideoByDirectUpload(false)).rejects.toThrow(
        "Couldn't get upload information from cloudflare"
      )
    })

    it('should throw error when Mux response is missing url', async () => {
      mockMux.video.uploads.create.mockResolvedValueOnce({
        id: 'upload-id'
      } as any)

      await expect(createVideoByDirectUpload(false)).rejects.toThrow(
        "Couldn't get upload information from cloudflare"
      )
    })
  })

  describe('createVideoFromUrl', () => {
    it('should create video asset from URL for publisher', async () => {
      const mockAsset = { id: 'asset-id', status: 'ready' } as any
      mockMux.video.assets.create.mockResolvedValueOnce(mockAsset)

      const result = await createVideoFromUrl(
        'https://example.com/video.mp4',
        false
      )

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_access_token',
        tokenSecret: 'mux_secret_key'
      })
      expect(mockMux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        encoding_tier: 'smart',
        playback_policy: ['public'],
        max_resolution_tier: undefined,
        static_renditions: []
      })
      expect(result).toBe(mockAsset)
    })

    it('should create video asset from URL for UGC', async () => {
      const mockAsset = { id: 'ugc-asset-id', status: 'ready' } as any
      mockMux.video.assets.create.mockResolvedValueOnce(mockAsset)

      await createVideoFromUrl(
        'https://example.com/video.mp4',
        true,
        '2160p',
        true
      )

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(mockMux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        encoding_tier: 'smart',
        playback_policy: ['public'],
        max_resolution_tier: '1080p',
        static_renditions: [
          { resolution: '270p' },
          { resolution: '360p' },
          { resolution: '480p' },
          { resolution: '720p' },
          { resolution: '1080p' },
          { resolution: '1440p' },
          { resolution: '2160p' }
        ]
      })
    })
  })

  describe('getVideo', () => {
    it('should retrieve video asset for publisher', async () => {
      const mockAsset = { id: 'asset-id', status: 'ready' } as any
      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getVideo('asset-id', false)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_access_token',
        tokenSecret: 'mux_secret_key'
      })
      expect(mockMux.video.assets.retrieve).toHaveBeenCalledWith('asset-id')
      expect(result).toBe(mockAsset)
    })

    it('should retrieve video asset for UGC', async () => {
      const mockAsset = { id: 'ugc-asset-id', status: 'ready' } as any
      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getVideo('ugc-asset-id', true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(result).toBe(mockAsset)
    })
  })

  describe('getUpload', () => {
    it('should retrieve upload for publisher', async () => {
      const mockUpload = { id: 'upload-id', asset_id: 'asset-id' } as any
      mockMux.video.uploads.retrieve.mockResolvedValueOnce(mockUpload)

      const result = await getUpload('upload-id', false)

      expect(mockMux.video.uploads.retrieve).toHaveBeenCalledWith('upload-id')
      expect(result).toBe(mockUpload)
    })

    it('should retrieve upload for UGC', async () => {
      const mockUpload = {
        id: 'ugc-upload-id',
        asset_id: 'ugc-asset-id'
      } as any
      mockMux.video.uploads.retrieve.mockResolvedValueOnce(mockUpload)

      const result = await getUpload('ugc-upload-id', true)

      expect(result).toBe(mockUpload)
    })
  })

  describe('deleteVideo', () => {
    it('should delete video asset for publisher', async () => {
      mockMux.video.assets.delete.mockResolvedValueOnce(undefined as any)

      await deleteVideo('asset-id', false)

      expect(mockMux.video.assets.delete).toHaveBeenCalledWith('asset-id')
    })

    it('should delete video asset for UGC', async () => {
      mockMux.video.assets.delete.mockResolvedValueOnce(undefined as any)

      await deleteVideo('ugc-asset-id', true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(mockMux.video.assets.delete).toHaveBeenCalledWith('ugc-asset-id')
    })
  })

  describe('enableDownload', () => {
    it('should enable download when resolution does not exist', async () => {
      const mockAsset = {
        id: 'asset-id',
        static_renditions: {
          files: [{ resolution: '720p' }, { resolution: '360p' }]
        }
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)
      mockMux.post.mockResolvedValueOnce({} as any)

      await enableDownload('asset-id', false, '1080p')

      expect(mockMux.video.assets.retrieve).toHaveBeenCalledWith('asset-id')
      expect(mockMux.post).toHaveBeenCalledWith(
        '/video/v1/assets/asset-id/static-renditions',
        {
          body: { resolution: '1080p' }
        }
      )
    })

    it('should skip creating download when resolution already exists', async () => {
      const mockAsset = {
        id: 'asset-id',
        static_renditions: {
          files: [{ resolution: '1080p' }, { resolution: '720p' }]
        }
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      await enableDownload('asset-id', false, '1080p')

      expect(mockMux.video.assets.retrieve).toHaveBeenCalledWith('asset-id')
      expect(mockMux.post).not.toHaveBeenCalled()
    })

    it('should handle asset with no static renditions', async () => {
      const mockAsset = {
        id: 'asset-id',
        static_renditions: null
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)
      mockMux.post.mockResolvedValueOnce({} as any)

      await enableDownload('asset-id', false, '1080p')

      expect(mockMux.post).toHaveBeenCalledWith(
        '/video/v1/assets/asset-id/static-renditions',
        {
          body: { resolution: '1080p' }
        }
      )
    })

    it('should handle asset with empty files array', async () => {
      const mockAsset = {
        id: 'asset-id',
        static_renditions: {
          files: []
        }
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)
      mockMux.post.mockResolvedValueOnce({} as any)

      await enableDownload('asset-id', false, '1080p')

      expect(mockMux.post).toHaveBeenCalledWith(
        '/video/v1/assets/asset-id/static-renditions',
        {
          body: { resolution: '1080p' }
        }
      )
    })
  })

  describe('getStaticRenditions', () => {
    it('should retrieve static renditions for publisher', async () => {
      const mockStaticRenditions = {
        files: [
          {
            name: 'video_1080p.mp4',
            ext: 'mp4',
            height: 1080,
            width: 1920,
            bitrate: 5000000,
            filesize: '104857600',
            resolution: '1080p',
            status: 'ready'
          }
        ]
      }
      const mockAsset = {
        id: 'asset-id',
        static_renditions: mockStaticRenditions
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getStaticRenditions('asset-id', false)

      expect(mockMux.video.assets.retrieve).toHaveBeenCalledWith('asset-id')
      expect(result).toBe(mockStaticRenditions)
    })

    it('should retrieve static renditions for UGC', async () => {
      const mockStaticRenditions = {
        files: [
          {
            name: 'ugc_video_720p.mp4',
            ext: 'mp4',
            height: 720,
            width: 1280,
            resolution: '720p',
            status: 'ready'
          }
        ]
      }
      const mockAsset = {
        id: 'ugc-asset-id',
        static_renditions: mockStaticRenditions
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getStaticRenditions('ugc-asset-id', true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(result).toBe(mockStaticRenditions)
    })

    it('should return null static renditions when asset has none', async () => {
      const mockAsset = {
        id: 'asset-id',
        static_renditions: null
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getStaticRenditions('asset-id', false)

      expect(result).toBeNull()
    })

    it('should return undefined static renditions when not set', async () => {
      const mockAsset = {
        id: 'asset-id'
      } as any

      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getStaticRenditions('asset-id', false)

      expect(result).toBeUndefined()
    })
  })
})
