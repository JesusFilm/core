import { VideoVariant } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../../test/prismaMock'
import { processTable } from '../../../importer'

import { importMany, importOne, importSourceUrls } from './sourceUrls'

jest.mock('../../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../../importer').parse,
  parseMany: jest.requireActual('../../../importer').parseMany
}))

describe('bigQuery/importers/videoVariants/sourceUrls', () => {
  describe('importSourceUrls', () => {
    it('should import sourceUrls', async () => {
      await importSourceUrls()
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
    it('should import one sourceUrl', async () => {
      prismaMock.videoVariant.update.mockResolvedValue({} as VideoVariant)
      await importOne({
        videoVariantId: 'variant1',
        masterUri: 'https://example.com/video.mp4',
        updatedAt: { value: '2024-02-14T00:00:00Z' }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant1' },
        data: { sourceUrl: 'https://example.com/video.mp4' }
      })
    })

    it('should handle null masterUri', async () => {
      prismaMock.videoVariant.update.mockResolvedValue({} as VideoVariant)
      await importOne({
        videoVariantId: 'variant1',
        masterUri: null,
        updatedAt: { value: '2024-02-14T00:00:00Z' }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant1' },
        data: { sourceUrl: null }
      })
    })

    it('should throw error if row does not match schema', async () => {
      await expect(
        importOne({
          invalidField: 'value'
        })
      ).rejects.toThrow()
    })

    it('should include videoVariantId in error message when update fails', async () => {
      prismaMock.videoVariant.update.mockRejectedValue(
        new Error('Record not found')
      )
      await expect(
        importOne({
          videoVariantId: 'variant1',
          masterUri: 'https://example.com/video.mp4',
          updatedAt: { value: '2024-02-14T00:00:00Z' }
        })
      ).rejects.toThrow(
        'Failed to update video variant variant1: Record not found'
      )
    })
  })

  describe('importMany', () => {
    it('should import many sourceUrls', async () => {
      prismaMock.videoVariant.update.mockResolvedValue({} as VideoVariant)
      await importMany([
        {
          videoVariantId: 'variant1',
          masterUri: 'https://example.com/video1.mp4',
          updatedAt: { value: '2024-02-14T00:00:00Z' }
        },
        {
          videoVariantId: 'variant2',
          masterUri: 'https://example.com/video2.mp4',
          updatedAt: { value: '2024-02-14T00:00:00Z' }
        }
      ])
      expect(prismaMock.videoVariant.update).toHaveBeenCalledTimes(2)
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant1' },
        data: { sourceUrl: 'https://example.com/video1.mp4' }
      })
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant2' },
        data: { sourceUrl: 'https://example.com/video2.mp4' }
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      await expect(
        importMany([
          {
            invalidField: 'value'
          },
          {
            anotherInvalidField: 'value'
          }
        ])
      ).rejects.toThrow('some rows do not match schema')
    })

    it('should include videoVariantId in error message when update fails', async () => {
      prismaMock.videoVariant.update
        .mockResolvedValueOnce({} as VideoVariant)
        .mockRejectedValueOnce(new Error('Record not found'))
      await expect(
        importMany([
          {
            videoVariantId: 'variant1',
            masterUri: 'https://example.com/video1.mp4',
            updatedAt: { value: '2024-02-14T00:00:00Z' }
          },
          {
            videoVariantId: 'variant2',
            masterUri: 'https://example.com/video2.mp4',
            updatedAt: { value: '2024-02-14T00:00:00Z' }
          }
        ])
      ).rejects.toThrow(
        'Failed to update video variant variant2: Record not found'
      )
    })
  })
})
