import { VideoVariant } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importMasterUrls, importOne } from './masterUrls'

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

describe('bigQuery/importers/masterUrls', () => {
  describe('importS3Videos', () => {
    it('should import master videos to mux', async () => {
      await importMasterUrls()
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
    it('should import one master video', async () => {
      prismaMock.videoVariant.update.mockResolvedValue(
        {} as unknown as VideoVariant
      )
      await importOne({
        height: 180,
        width: 320,
        masterUri: 'https://www.example.com',
        videoVariantId: 'mockVariantId'
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: {
          id: 'mockVariantId'
        },
        data: {
          masterUrl: 'https://www.example.com',
          masterWidth: 320,
          masterHeight: 180
        }
      })
    })

    it('should throw error if videoVariant is not found', async () => {
      await expect(
        importOne({
          height: 180,
          width: 320,
          masterUri: 'https://www.example.com',
          videoVariantId: 'mockVariantId2'
        })
      ).rejects.toThrow('VideoVariant with id mockVariantId2 not found')
    })
  })

  describe('importMany', () => {
    // beforeEach(() => {
    //   prismaMock.$transaction.mockImplementation((callback) =>
    //     Promise.resolve(callback(prismaMock))
    //   )
    // })

    it('should import many master videos', async () => {
      prismaMock.videoVariant.update.mockResolvedValue(
        {} as unknown as VideoVariant
      )
      await importMany([
        {
          height: 180,
          width: 320,
          masterUri: 'https://www.example.com',
          videoVariantId: 'mockVariantId'
        },
        {
          height: 180,
          width: 320,
          masterUri: 'https://www.example.com',
          videoVariantId: 'mockVariantId1'
        }
      ])
      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: {
          id: 'mockVariantId'
        },
        data: {
          masterUrl: 'https://www.example.com',
          masterWidth: 320,
          masterHeight: 180
        }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: {
          id: 'mockVariantId1'
        },
        data: {
          masterUrl: 'https://www.example.com',
          masterWidth: 320,
          masterHeight: 180
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
