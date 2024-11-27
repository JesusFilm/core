import { VideoSubtitle } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './videoSubtitles'

import { importVideoSubtitles } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../videos', () => ({
  getVideoIds: jest.fn().mockReturnValue(['mockVideoId', 'mockVideoId1'])
}))

describe('bigQuery/importers/videoSubtitles', () => {
  describe('importVideoSubtitles', () => {
    it('should import videoSubtitles', async () => {
      await importVideoSubtitles()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one videoSubtitle', async () => {
      prismaMock.videoSubtitle.upsert.mockResolvedValue(
        {} as unknown as VideoSubtitle
      )
      await importOne({
        languageId: 529,
        video: 'mockVideoId',
        vttSrc: 'mockVttSrc',
        srtSrc: 'mockSrtSrc',
        edition: null
      })
      expect(prismaMock.videoEdition.upsert).toHaveBeenCalledWith({
        create: { name: 'base', videoId: 'mockVideoId' },
        update: {},
        where: { videoId_name: { name: 'base', videoId: 'mockVideoId' } }
      })
      expect(prismaMock.videoSubtitle.upsert).toHaveBeenCalledWith({
        where: {
          videoId_edition_languageId: {
            languageId: '529',
            videoId: 'mockVideoId',
            edition: 'base'
          }
        },
        create: {
          languageId: '529',
          primary: true,
          videoId: 'mockVideoId',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: 'base'
        },
        update: {
          languageId: '529',
          primary: true,
          videoId: 'mockVideoId',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: 'base'
        }
      })
    })

    it('should throw error if video is not found', async () => {
      await expect(
        importOne({
          languageId: 529,
          video: 'mockVideoId2',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: null
        })
      ).rejects.toThrow('Video with id mockVideoId2 not found')
    })
  })

  describe('importMany', () => {
    it('should import many videoSubtitles', async () => {
      await importMany([
        {
          value: 'mockValue',
          languageId: 529,
          video: 'mockVideoId',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: null
        },
        {
          value: 'mockValue1',
          languageId: 529,
          video: 'mockVideoId1',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: 'ct'
        }
      ])
      expect(prismaMock.videoEdition.upsert).toHaveBeenCalledWith({
        create: { name: 'base', videoId: 'mockVideoId' },
        update: {},
        where: { videoId_name: { name: 'base', videoId: 'mockVideoId' } }
      })
      expect(prismaMock.videoEdition.upsert).toHaveBeenCalledWith({
        create: { name: 'ct', videoId: 'mockVideoId1' },
        update: {},
        where: { videoId_name: { name: 'ct', videoId: 'mockVideoId1' } }
      })
      expect(prismaMock.videoEdition.upsert).toHaveBeenCalledTimes(2)
      expect(prismaMock.videoSubtitle.createMany).toHaveBeenCalledWith({
        data: [
          {
            primary: true,
            languageId: '529',
            videoId: 'mockVideoId',
            vttSrc: 'mockVttSrc',
            srtSrc: 'mockSrtSrc',
            edition: 'base'
          },
          {
            primary: true,
            languageId: '529',
            videoId: 'mockVideoId1',
            vttSrc: 'mockVttSrc',
            srtSrc: 'mockSrtSrc',
            edition: 'ct'
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
            value: 'TestVideoSubtitle'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
