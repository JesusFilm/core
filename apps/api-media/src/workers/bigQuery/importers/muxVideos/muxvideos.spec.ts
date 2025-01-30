import clone from 'lodash/clone'

import { MuxVideo, VideoVariant } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import {
  createMuxAsset,
  importMany,
  importOne,
  importS3Videos
} from './muxVideos'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videoVariants', () => ({
  getVideoVariantIds: jest
    .fn()
    .mockReturnValue(['mockVariantId', 'mockVariantId1'])
}))

jest.mock('@mux/mux-node', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    video: {
      assets: {
        create: jest.fn().mockResolvedValue({
          id: 'mockAssetId'
        })
      }
    }
  }))
}))

jest.mock('./muxVideos', () => {
  const originalModule = jest.requireActual('./muxVideos')
  return {
    __esModule: true,
    ...originalModule,
    createMuxAsset: jest.fn().mockResolvedValue({ id: 'mockAssetId' })
  }
})

describe('bigQuery/importers/muxVideos', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env.MUX_ACCESS_TOKEN_ID = 'muxAccessId'
    process.env.MUX_SECRET_KEY = 'muxSecretKey'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('importS3Videos', () => {
    it('should import master videos to mux', async () => {
      await importS3Videos()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantMaster_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one master video to mux', async () => {
      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mockId'
      } as unknown as MuxVideo)
      prismaMock.videoVariant.update.mockResolvedValue(
        {} as unknown as VideoVariant
      )
      await importOne({
        height: 180,
        width: 320,
        masterUri: 'www.example.com',
        videoVariantId: 'mockVariantId'
      })
      // expect(createMuxAsset).toHaveBeenCalledWith({
      //   input: [
      //     {
      //       url: 'www.example.com'
      //     }
      //   ],
      //   encoding_tier: 'smart',
      //   playback_policy: ['public'],
      //   max_resolution_tier: '1080p',
      //   mp4_support: 'capped-1080p'
      // })
      expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
        data: {
          assetId: 'mockAssetId',
          userId: 'system'
        }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: {
          id: 'mockVariantId'
        },
        data: {
          muxVideoId: 'mockId'
        }
      })
    })

    it('should throw error if videoVariant is not found', async () => {
      await expect(
        importOne({
          height: 180,
          width: 320,
          masterUri: 'www.example.com',
          videoVariantId: 'mockVariantId2'
        })
      ).rejects.toThrow('VideoVariant with id mockVariantId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoVariantDownloads', async () => {
      prismaMock.muxVideo.create.mockResolvedValue({
        id: 'mockId'
      } as unknown as MuxVideo)
      prismaMock.videoVariant.update.mockResolvedValue(
        {} as unknown as VideoVariant
      )
      await importMany([
        {
          height: 180,
          width: 320,
          masterUri: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        {
          height: 180,
          width: 320,
          masterUri: 'www.example.com',
          videoVariantId: 'mockVariantId1'
        }
      ])
      expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
        data: {
          assetId: 'mockAssetId',
          userId: 'system'
        }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: {
          id: 'mockVariantId'
        },
        data: {
          muxVideoId: 'mockId'
        }
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      await expect(
        importMany([
          {
            id: 1
          },
          {
            value: 'TestVideoVariantDownload'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
