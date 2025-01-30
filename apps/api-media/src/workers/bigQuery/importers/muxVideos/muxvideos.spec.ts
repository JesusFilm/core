import { clone } from 'lodash'

import { MuxVideo, VideoVariantDownload } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne, importS3Videos } from './muxVideos'

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

describe('bigQuery/importers/muxVideos', () => {
  const assetCreate = jest.fn().mockResolvedValue({
    id: 'mockAssetId'
  })

  const getMuxClient = jest.fn().mockReturnValue({
    video: {
      assets: {
        create: assetCreate
      }
    }
  })

  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env.MUX_ACCESS_TOKEN_ID = 'muxAccessId'
    process.env.MUX_SECRET_KEY = 'muxSecretKey'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  jest.mock('./muxVideos', () => ({
    getMuxClient
  }))

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
      prismaMock.muxVideo.create.mockResolvedValue({} as unknown as MuxVideo)
      await importOne({
        height: 180,
        width: 320,
        masterUri: 'www.example.com',
        videoVariantId: 'mockVariantId',
        updatedAt: new Date()
      })
      expect(assetCreate).toHaveBeenCalledWith({
        input: [
          {
            url: 'www.example.com'
          }
        ],
        encoding_tier: 'smart',
        playback_policy: ['public'],
        max_resolution_tier: '1080p',
        mp4_support: 'capped-1080p'
      })
      expect(prismaMock.videoVariantDownload.upsert).toHaveBeenCalledWith({
        where: {
          quality_videoVariantId: {
            quality: 'low',
            videoVariantId: 'mockVariantId'
          }
        },
        create: {
          quality: 'low',
          size: 1111112,
          height: 180,
          width: 320,
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        update: {
          quality: 'low',
          size: 1111112,
          height: 180,
          width: 320,
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        }
      })
    })

    it('should throw error if videoVariant is not found', async () => {
      await expect(
        importOne({
          quality: 'low',
          size: 1111112,
          height: 180,
          width: 320,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId2'
        })
      ).rejects.toThrow('VideoVariant with id mockVariantId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoVariantDownloads', async () => {
      await importMany([
        {
          quality: 'low',
          size: 1111112,
          height: 180,
          width: 320,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        {
          quality: 'low',
          size: 1111112,
          height: 180,
          width: 320,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId1'
        }
      ])
      expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledWith({
        data: [
          {
            quality: 'low',
            size: 1111112,
            height: 180,
            width: 320,
            url: 'www.example.com',
            videoVariantId: 'mockVariantId'
          },
          {
            quality: 'low',
            size: 1111112,
            height: 180,
            width: 320,
            url: 'www.example.com',
            videoVariantId: 'mockVariantId1'
          }
        ],
        skipDuplicates: true
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
