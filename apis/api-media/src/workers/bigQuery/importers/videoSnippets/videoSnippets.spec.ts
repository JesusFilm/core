import { VideoSnippet } from '@core/prisma-media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoSnippets'

import { importVideoSnippets } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/videoSnippets', () => {
  describe('importVideoSnippets', () => {
    it('should import videoSnippets', async () => {
      await importVideoSnippets()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoSnippet_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one videoSnippet', async () => {
      prismaMock.videoSnippet.upsert.mockResolvedValue(
        {} as unknown as VideoSnippet
      )
      await importOne({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1
      })
      expect(prismaMock.videoSnippet.upsert).toHaveBeenCalledWith({
        where: {
          videoId_languageId: {
            languageId: '529',
            videoId: 'mockVideoId'
          }
        },
        create: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        update: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        }
      })
    })

    it('should throw error if video is not found', async () => {
      await expect(
        importOne({
          value: 'mockValue0',
          videoId: 'mockVideoId2',
          languageId: 529,
          primary: 1
        })
      ).rejects.toThrow('Video with id mockVideoId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoSnippets', async () => {
      await importMany([
        {
          value: 'mockValue',
          videoId: 'mockVideoId',
          languageId: 529,
          primary: 1
        },
        {
          value: 'mockValue1',
          videoId: 'mockVideoId1',
          languageId: 529,
          primary: 1
        },
        {
          value: 'mockValue2',
          videoId: 'mockVideoId2',
          languageId: 529,
          primary: 1
        }
      ])
      expect(prismaMock.videoSnippet.createMany).toHaveBeenCalledWith({
        data: [
          {
            value: 'mockValue',
            videoId: 'mockVideoId',
            languageId: '529',
            primary: true
          },
          {
            value: 'mockValue1',
            videoId: 'mockVideoId1',
            languageId: '529',
            primary: true
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
            value: 'TestVideoSnippet'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
