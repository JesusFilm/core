import { VideoStudyQuestion } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoStudyQuestions'

import { importVideoStudyQuestions } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/videoStudyQuestions', () => {
  describe('importVideoStudyQuestions', () => {
    it('should import videoStudyQuestions', async () => {
      await importVideoStudyQuestions()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoStudyQuestions_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one videoStudyQuestion', async () => {
      prismaMock.videoStudyQuestion.upsert.mockResolvedValue(
        {} as unknown as VideoStudyQuestion
      )
      await importOne({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        order: 3,
        crowdinId: 'mockCrowdinId'
      })
      expect(prismaMock.videoStudyQuestion.upsert).toHaveBeenCalledWith({
        where: {
          videoId_languageId_order: {
            languageId: '529',
            videoId: 'mockVideoId',
            order: 3
          }
        },
        create: {
          crowdInId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        update: {
          crowdInId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
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
          primary: 1,
          order: 3,
          crowdinId: 'mockCrowdinId'
        })
      ).rejects.toThrow('Video with id mockVideoId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoStudyQuestions', async () => {
      await importMany([
        {
          value: 'mockValue',
          videoId: 'mockVideoId',
          languageId: 529,
          primary: 1,
          order: 3,
          crowdinId: 'mockCrowdinId'
        },
        {
          value: 'mockValue1',
          videoId: 'mockVideoId1',
          languageId: 529,
          primary: 1,
          order: 3,
          crowdinId: 'mockCrowdinId1'
        }
      ])
      expect(prismaMock.videoStudyQuestion.createMany).toHaveBeenCalledWith({
        data: [
          {
            value: 'mockValue',
            videoId: 'mockVideoId',
            languageId: '529',
            primary: true,
            order: 3,
            crowdInId: 'mockCrowdinId'
          },
          {
            value: 'mockValue1',
            videoId: 'mockVideoId1',
            languageId: '529',
            primary: true,
            order: 3,
            crowdInId: 'mockCrowdinId1'
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
            value: 'TestVideoStudyQuestion'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
