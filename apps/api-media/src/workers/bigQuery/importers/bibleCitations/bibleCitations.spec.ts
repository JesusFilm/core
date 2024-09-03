import { BibleCitation } from '.prisma/api-media-client'

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
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId'])
}))

jest.mock('../bibleBooks', () => ({
  getBibleBookIds: jest.fn().mockReturnValue(['1'])
}))

describe('bigQuery/importers/bibleCitations', () => {
  describe('importBibleCitations', () => {
    it('should import bibleCitations', async () => {
      await importBibleCitations()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoBibleCitation_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })

    describe('importOne', () => {
      it('should import one biblecitation', async () => {
        prismaMock.bibleCitation.upsert.mockResolvedValue(
          {} as unknown as BibleCitation
        )
        await importOne({
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: 1,
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          position: 1,
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        })
        expect(prismaMock.bibleCitation.upsert).toHaveBeenCalledWith({
          where: { id: 'mockUuid' },
          update: {
            id: 'mockUuid',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
          },
          create: {
            id: 'mockUuid',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
          }
        })
      })
    })
  })

  describe('importMany', () => {
    it('should import many bibleCitations', async () => {
      await importMany([
        {
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: 1,
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          position: 1,
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        },
        {
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: 1,
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          position: 1,
          datastream_metadata: {
            uuid: 'mockUuid1'
          }
        }
      ])
      expect(prismaMock.bibleCitation.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockUuid',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
          },
          {
            id: 'mockUuid1',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
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
            value: 'TestBibleCitation'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
