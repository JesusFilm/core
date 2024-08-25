import { AudioPreview } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import { importAudioPreview, importMany, importOne } from './audioPreviews'

const audioPreview = {
  value: 'abc.mp3',
  size: 1024,
  duration: 10,
  languageId: '20615'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    value: 'abc.mp3',
    size: 1024,
    duration: 10,
    languageId: '20615'
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        value: 'abc.mp3',
        size: 1024,
        duration: 10,
        languageId: '20615'
      },
      {
        value: 'abc.mp3',
        size: 1024,
        duration: 10,
        languageId: '20615'
      }
    ]
  })
}))

describe('bigquery/importers/audioPreviews', () => {
  describe('importAudioPreview', () => {
    it('should import audio previews', async () => {
      await importAudioPreview(['20615'])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_audioPreview_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one audio preview', async () => {
      prismaMock.audioPreview.upsert.mockResolvedValue(
        {} as unknown as AudioPreview
      )
      await importAudioPreview(['20615'])
      await importOne({
        languageId: '20615',
        duration: 10,
        size: 1024,
        value: 'abc.mp3',
        updatedAt: { value: '2021-01-01T00:00:00.000Z' }
      })
      expect(parse).toHaveBeenCalled()
      expect(prismaMock.audioPreview.upsert).toHaveBeenCalledWith({
        where: { languageId: '20615' },
        create: audioPreview,
        update: audioPreview
      })
    })

    it('should throw error if language not found', async () => {
      await importAudioPreview([])
      await expect(
        importOne({
          languageId: '20616',
          duration: 10,
          size: 1024,
          value: 'abc.mp3',
          updatedAt: { value: '2021-01-01T00:00:00.000Z' }
        })
      ).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many audio previews', async () => {
      prismaMock.audioPreview.createMany.mockImplementation()
      await importAudioPreview(['20615'])
      await importMany([
        {
          languageId: '20615',
          duration: 10,
          size: 1024,
          value: 'abc.mp3',
          updatedAt: { value: '2021-01-01T00:00:00.000Z' }
        },
        {
          languageId: '20615',
          duration: 10,
          size: 1024,
          value: 'abc.mp3',
          updatedAt: { value: '2021-01-01T00:00:00.000Z' }
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.audioPreview.createMany).toHaveBeenCalledWith({
        data: [audioPreview, audioPreview],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.audioPreview.createMany.mockImplementation()
      await importAudioPreview(['20615'])
      await expect(
        importMany([
          {
            languageId: '20615',
            duration: 10,
            size: 1024,
            value: 'abc.mp3',
            updatedAt: { value: '2021-01-01T00:00:00.000Z' }
          },
          {
            languageId: '20615',
            duration: 10,
            size: 1024,
            value: 'abc.mp3',
            updatedAt: { value: '2021-01-01T00:00:00.000Z' }
          },
          {
            languageId: '20616',
            duration: 10,
            size: 1024,
            value: 'abc.mp3',
            updatedAt: { value: '2021-01-01T00:00:00.000Z' }
          }
        ])
      ).rejects.toThrow()
    })
  })
})
