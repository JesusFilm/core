import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './audioPreviews'

import { importAudioPreviews } from '.'

const bigQueryAudioPreview = {
  languageId: 20615,
  duration: 10,
  size: 1024,
  value: 'abc.mp3',
  updatedAt: { value: '2021-01-01T00:00:00.000Z' }
}
const prismaAudioPreview = {
  value: 'abc.mp3',
  size: 1024,
  duration: 10,
  languageId: '20615',
  updatedAt: '2021-01-01T00:00:00.000Z'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../languages', () => ({
  getLanguageIds: jest.fn().mockReturnValue(['20615'])
}))

describe('bigQuery/importers/audioPreviews', () => {
  describe('importAudioPreviews', () => {
    it('should import audio previews', async () => {
      await importAudioPreviews()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_audioPreview_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one audio preview', async () => {
      await importOne(bigQueryAudioPreview)
      expect(prismaMock.audioPreview.upsert).toHaveBeenCalledWith({
        where: { languageId: '20615' },
        create: prismaAudioPreview,
        update: prismaAudioPreview
      })
    })

    it('should throw error if language not found', async () => {
      await expect(
        importOne({
          ...bigQueryAudioPreview,
          languageId: 20616
        })
      ).rejects.toThrow('Language with id 20616 not found')
    })
  })

  describe('importMany', () => {
    it('should import many audio previews', async () => {
      prismaMock.audioPreview.createMany.mockImplementation()
      await importMany([bigQueryAudioPreview, bigQueryAudioPreview])
      expect(prismaMock.audioPreview.createMany).toHaveBeenCalledWith({
        data: [prismaAudioPreview, prismaAudioPreview],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.audioPreview.createMany.mockImplementation()
      await expect(
        importMany([
          bigQueryAudioPreview,
          { ...bigQueryAudioPreview, languageId: undefined }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
