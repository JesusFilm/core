import Mux from '@mux/mux-node'
import { mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { getClient, getVideo } from './services'

const mockMux = mockDeep<Mux>()

jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn(() => mockMux)
}))

describe('Mux Services', () => {
  const originalEnv = clone(process.env)
  const MockedMux = Mux as jest.MockedClass<typeof Mux>

  beforeEach(() => {
    process.env = originalEnv
    process.env.MUX_ACCESS_TOKEN_ID = 'mux_access_token'
    process.env.MUX_SECRET_KEY = 'mux_secret_key'
    process.env.MUX_UGC_ACCESS_TOKEN_ID = 'mux_ugc_access_token'
    process.env.MUX_UGC_SECRET_KEY = 'mux_ugc_secret_key'
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getClient', () => {
    it('should return publisher client when userGenerated is false', () => {
      const client = getClient(false)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_access_token',
        tokenSecret: 'mux_secret_key'
      })
      expect(client).toBe(mockMux)
    })

    it('should return UGC client when userGenerated is true', () => {
      const client = getClient(true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(client).toBe(mockMux)
    })

    it('should throw error when MUX_ACCESS_TOKEN_ID is missing', () => {
      delete process.env.MUX_ACCESS_TOKEN_ID

      expect(() => getClient(false)).toThrow('Missing MUX_ACCESS_TOKEN_ID')
    })

    it('should throw error when MUX_SECRET_KEY is missing', () => {
      delete process.env.MUX_SECRET_KEY

      expect(() => getClient(false)).toThrow('Missing MUX_SECRET_KEY')
    })

    it('should throw error when MUX_UGC_ACCESS_TOKEN_ID is missing', () => {
      delete process.env.MUX_UGC_ACCESS_TOKEN_ID

      expect(() => getClient(true)).toThrow('Missing MUX_UGC_ACCESS_TOKEN_ID')
    })

    it('should throw error when MUX_UGC_SECRET_KEY is missing', () => {
      delete process.env.MUX_UGC_SECRET_KEY

      expect(() => getClient(true)).toThrow('Missing MUX_UGC_SECRET_KEY')
    })
  })

  describe('getVideo', () => {
    it('should retrieve video for publisher', async () => {
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

    it('should retrieve video for UGC', async () => {
      const mockAsset = { id: 'ugc-asset-id', status: 'ready' } as any
      mockMux.video.assets.retrieve.mockResolvedValueOnce(mockAsset)

      const result = await getVideo('ugc-asset-id', true)

      expect(MockedMux).toHaveBeenCalledWith({
        tokenId: 'mux_ugc_access_token',
        tokenSecret: 'mux_ugc_secret_key'
      })
      expect(mockMux.video.assets.retrieve).toHaveBeenCalledWith('ugc-asset-id')
      expect(result).toBe(mockAsset)
    })
  })
})
