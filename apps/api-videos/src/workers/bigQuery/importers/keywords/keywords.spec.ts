import { Keyword } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './keywords'

import { importKeywords } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['video1', 'video2', 'video3'])
}))

describe('bigQuery/importers/keywords', () => {
  describe('importKeywords', () => {
    it('should import keywords', async () => {
      await importKeywords()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_keywords_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one keyword', async () => {
      prismaMock.keyword.upsert.mockResolvedValue({} as unknown as Keyword)
      await importOne({
        value: 'TestKeyword',
        languageId: 529,
        videoIds: 'video1,video2',
        datastream_metadata: {
          uuid: 'mockUuid'
        }
      })
      expect(prismaMock.keyword.upsert).toHaveBeenCalledWith({
        where: {
          value_languageId: { value: 'TestKeyword', languageId: '529' }
        },
        update: {
          id: 'mockUuid',
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        },
        create: {
          id: 'mockUuid',
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        }
      })
    })
  })

  describe('importMany', () => {
    it('should import many keywords', async () => {
      await importMany([
        {
          value: 'TestKeyword1',
          languageId: 529,
          videoIds: 'video1,video2',
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        },
        {
          value: 'TestKeyword2',
          languageId: 529,
          videoIds: 'video3',
          datastream_metadata: {
            uuid: 'mockUuid1'
          }
        }
      ])
      expect(prismaMock.keyword.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockUuid',
            value: 'TestKeyword1',
            languageId: '529'
          },
          {
            id: 'mockUuid1',
            value: 'TestKeyword2',
            languageId: '529'
          }
        ],
        skipDuplicates: true
      })
      expect(prismaMock.keyword.update).toHaveBeenCalledWith({
        where: { id: 'mockUuid' },
        data: {
          videos: {
            connect: [{ id: 'video1' }, { id: 'video2' }]
          }
        }
      })
      expect(prismaMock.keyword.update).toHaveBeenCalledWith({
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
            value: 'TestKeyword'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
