import { CloudflareImage, ImageAspectRatio } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoImages'

import { importVideoImages } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/videoImages', () => {
  describe('importVideoImages', () => {
    it('should import video image', async () => {
      await importVideoImages()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one video image', async () => {
      prismaMock.cloudflareImage.upsert.mockResolvedValue(
        {} as unknown as CloudflareImage
      )
      await importOne({
        id: 'mockId',
        videoId: 'mockVideoId',
        aspectRatio: ImageAspectRatio.hd,
        uploadUrl: 'https://example.com'
      })
      expect(prismaMock.cloudflareImage.upsert).toHaveBeenCalledWith({
        where: {
          id: 'mockId'
        },
        create: {
          id: 'mockId',
          videoId: 'mockVideoId',
          aspectRatio: ImageAspectRatio.hd,
          uploadUrl: 'https://example.com',
          userId: 'system'
        },
        update: {
          id: 'mockId',
          videoId: 'mockVideoId',
          aspectRatio: ImageAspectRatio.hd,
          uploadUrl: 'https://example.com',
          userId: 'system'
        }
      })
    })

    it('should throw error if video is not found', async () => {
      await expect(
        importOne({
          id: 'mockId',
          videoId: 'mockVideoId',
          aspectRatio: ImageAspectRatio.hd,
          uploadUrl: 'https://example.com'
        })
      ).rejects.toThrow('Video with id mockVideoId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoTitles', async () => {
      await importMany([
        {
          id: 'mockId1',
          videoId: 'mockVideoId',
          aspectRatio: ImageAspectRatio.hd,
          uploadUrl: 'https://example.com'
        },
        {
          id: 'mockId2',
          videoId: 'mockVideoId',
          aspectRatio: ImageAspectRatio.banner,
          uploadUrl: 'https://example.com'
        }
      ])
      expect(prismaMock.videoTitle.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockId1',
            videoId: 'mockVideoId',
            aspectRatio: ImageAspectRatio.hd,
            uploadUrl: 'https://example.com',
            userId: 'system'
          },
          {
            id: 'mockId2',
            videoId: 'mockVideoId',
            aspectRatio: ImageAspectRatio.banner,
            uploadUrl: 'https://example.com',
            userId: 'system'
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
            value: 'TestVideoTitle'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
