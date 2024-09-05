import { VideoVariantDownload } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoVariantDownloads'

import { importVideoVariantDownloads } from '.'

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

describe('bigQuery/importers/videoVariantDownloads', () => {
  describe('importVideoVariantDownloads', () => {
    it('should import videoVariantDownloads', async () => {
      await importVideoVariantDownloads()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantDownload_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one videoVariantDownload', async () => {
      prismaMock.videoVariantDownload.upsert.mockResolvedValue(
        {} as unknown as VideoVariantDownload
      )
      await importOne({
        quality: 'low',
        size: 1111112,
        uri: 'www.example.com',
        videoVariantId: 'mockVariantId'
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
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        update: {
          quality: 'low',
          size: 1111112,
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
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        {
          quality: 'low',
          size: 1111112,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId1'
        }
      ])
      expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledWith({
        data: [
          {
            quality: 'low',
            size: 1111112,
            url: 'www.example.com',
            videoVariantId: 'mockVariantId'
          },
          {
            quality: 'low',
            size: 1111112,
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
