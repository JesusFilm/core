import { BibleCitation } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './bibleCitations'

import { importBibleCitations } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['video1', 'video2', 'video3'])
}))

describe('bigquery/importers/biblecitations', () => {
  describe('importBibleCitations', () => {
    it('should import biblecitations', async () => {
      await importBibleCitations()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_biblecitations_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one biblecitation', async () => {
      prismaMock.bibleCitation.upsert.mockResolvedValue(
        {} as unknown as BibleCitation
      )
      await importOne({
        value: 'TestBibleCitation',
        languageId: 529,
        videoIds: 'video1,video2',
        datastream_metadata: {
          uuid: 'mockUuid'
        }
      })
      expect(prismaMock.bibleCitation.upsert).toHaveBeenCalledWith({
        where: {
          value_languageId: { value: 'TestBibleCitation', languageId: '529' }
        },
        update: {
          id: 'mockUuid',
          value: 'TestBibleCitation',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        },
        create: {
          id: 'mockUuid',
          value: 'TestBibleCitation',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        }
      })
    })
  })

  describe('importMany', () => {
    it('should import many biblecitations', async () => {
      await importMany([
        {
          value: 'TestBibleCitation1',
          languageId: 529,
          videoIds: 'video1,video2',
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        },
        {
          value: 'TestBibleCitation2',
          languageId: 529,
          videoIds: 'video3',
          datastream_metadata: {
            uuid: 'mockUuid1'
          }
        }
      ])
      expect(prismaMock.bibleCitation.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockUuid',
            value: 'TestBibleCitation1',
            languageId: '529'
          },
          {
            id: 'mockUuid1',
            value: 'TestBibleCitation2',
            languageId: '529'
          }
        ],
        skipDuplicates: true
      })
      expect(prismaMock.bibleCitation.update).toHaveBeenCalledWith({
        where: { id: 'mockUuid' },
        data: {
          videos: {
            connect: [{ id: 'video1' }, { id: 'video2' }]
          }
        }
      })
      expect(prismaMock.bibleCitation.update).toHaveBeenCalledWith({
        where: { id: 'mockUuid1' },
        data: {
          videos: {
            connect: [{ id: 'video3' }]
          }
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
            value: 'TestBibleCitation'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
