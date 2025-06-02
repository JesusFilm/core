import { VideoVariant } from '@core/prisma-media/client'
import { Prisma } from '@prisma/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne, setVideoVariantIds } from './videoVariants'

import { getVideoVariantIds, importVideoVariants } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['videoId', 'videoId1']),
  getVideoSlugs: jest
    .fn()
    .mockReturnValue({ 'video-slug': 'videoId', 'video-slug-1': 'videoId1' })
}))

jest.mock('../languageSlugs', () => ({
  getLanguageSlugs: jest
    .fn()
    .mockReturnValue({ '529': 'english', '3804': 'korean' })
}))

describe('bigQuery/importers/videoVariants', () => {
  afterEach(() => {
    setVideoVariantIds([])
  })

  describe('importVideoVariants', () => {
    it('should import videoVariants', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValue([
        { id: '1' } as unknown as VideoVariant
      ])
      expect(getVideoVariantIds()).toEqual([])
      const cleanup = await importVideoVariants()
      expect(getVideoVariantIds()).toEqual(['1'])
      cleanup()
      expect(getVideoVariantIds()).toEqual([])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariant_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one videoVariant', async () => {
      prismaMock.videoVariant.upsert.mockResolvedValue(
        {} as unknown as VideoVariant
      )
      await importOne({
        id: '1',
        hls: 'www.example.com',
        dash: 'www.example.com',
        share: 'www.example.com',
        duration: 123.123,
        lengthInMilliseconds: 123456,
        languageId: 529,
        videoId: 'videoId',
        slug: 'variant-title',
        languageName: 'english',
        otherValues: 'some otherValue',
        someValue: 'otherValue',
        edition: 'mockEdition'
      })
      expect(prismaMock.videoEdition.upsert).toHaveBeenCalledWith({
        create: { name: 'mockEdition', videoId: 'videoId' },
        update: {},
        where: { name_videoId: { name: 'mockEdition', videoId: 'videoId' } }
      })
      expect(prismaMock.videoVariant.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        create: {
          duration: 123,
          lengthInMilliseconds: 123456,
          hls: 'www.example.com',
          dash: 'www.example.com',
          share: 'www.example.com',
          id: '1',
          languageId: '529',
          slug: 'video-slug/english',
          videoId: 'videoId',
          edition: 'mockEdition'
        },
        update: {
          duration: 123,
          lengthInMilliseconds: 123456,
          hls: 'www.example.com',
          dash: 'www.example.com',
          share: 'www.example.com',
          id: '1',
          languageId: '529',
          slug: 'video-slug/english',
          videoId: 'videoId',
          edition: 'mockEdition'
        }
      })
    })

    it('should throw error if video is not found', async () => {
      await expect(
        importOne({
          id: 'mockId',
          hls: 'www.example.com',
          dash: 'www.example.com',
          share: 'www.example.com',
          duration: 123.123,
          lengthInMilliseconds: 123456,
          languageId: 529,
          videoId: 'unknownVideoId',
          slug: 'Variant-Title',
          languageName: 'english',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        })
      ).rejects.toThrow('Video with id unknownVideoId not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoVariants', async () => {
      const transactionMock = {
        videoEdition: {
          upsert: jest.fn().mockResolvedValue({})
        },
        videoVariant: {
          createMany: jest.fn().mockResolvedValue({})
        },
        video: {
          findMany: jest.fn().mockResolvedValue([]),
          update: jest.fn().mockResolvedValue({})
        }
      } as unknown as Prisma.TransactionClient

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(transactionMock)
      })

      await importMany([
        {
          id: 'mockId',
          hls: 'www.example.com',
          dash: 'www.example.com',
          share: 'www.example.com',
          duration: 123.123,
          lengthInMilliseconds: 123456,
          languageId: 529,
          videoId: 'videoId',
          slug: 'variant-title',
          languageName: 'english',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        },
        {
          id: 'mockId1',
          hls: 'www.example.com',
          dash: 'www.example.com',
          share: 'www.example.com',
          duration: 123.123,
          lengthInMilliseconds: 123456,
          languageId: 3804,
          videoId: 'videoId1',
          slug: 'variant-title',
          languageName: 'korean',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        }
      ])

      expect(transactionMock.videoEdition.upsert).toHaveBeenCalledWith({
        create: { name: 'mockEdition', videoId: 'videoId' },
        update: {},
        where: { name_videoId: { name: 'mockEdition', videoId: 'videoId' } }
      })
      expect(transactionMock.videoEdition.upsert).toHaveBeenCalledTimes(2)
      expect(transactionMock.videoVariant.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockId',
            hls: 'www.example.com',
            dash: 'www.example.com',
            share: 'www.example.com',
            duration: 123,
            lengthInMilliseconds: 123456,
            languageId: '529',
            slug: 'video-slug/english',
            videoId: 'videoId',
            edition: 'mockEdition'
          },
          {
            id: 'mockId1',
            hls: 'www.example.com',
            dash: 'www.example.com',
            share: 'www.example.com',
            duration: 123,
            lengthInMilliseconds: 123456,
            languageId: '3804',
            slug: 'video-slug-1/korean',
            videoId: 'videoId1',
            edition: 'mockEdition'
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
            value: 'TestVideoVariant'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
