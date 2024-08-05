import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterVideoSubtitlesService } from './importerVideoSubtitle.service'

describe('ImporterVideoSubtitlesService', () => {
  let service: ImporterVideoSubtitlesService,
    prismaService: DeepMockProxy<PrismaService>,
    importerVideosService: ImporterVideosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoSubtitlesService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    service = module.get<ImporterVideoSubtitlesService>(
      ImporterVideoSubtitlesService
    )
    importerVideosService = module.get<ImporterVideosService>(
      ImporterVideosService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video subtitle', async () => {
      importerVideosService.ids = ['mockVideoId']
      await service.import({
        languageId: 529,
        video: 'mockVideoId',
        vttSrc: 'mockVttSrc',
        srtSrc: 'mockSrtSrc',
        edition: null
      })
      expect(prismaService.videoSubtitle.upsert).toHaveBeenCalledWith({
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

    it('should save many video subtitles', async () => {
      importerVideosService.ids = ['mockVideoId', 'mockVideoId1']
      await service.importMany([
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
      expect(prismaService.videoSubtitle.createMany).toHaveBeenCalledWith({
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

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 'mockValue0',
          label: 'invalidLabel',
          primaryLanguageId: 529
        })
      ).rejects.toThrow('row does not match schema: mockValue0')
    })

    it('should throw error if video is not found', async () => {
      importerVideosService.ids = []
      await expect(
        service.import({
          languageId: 529,
          video: 'mockVideoId',
          vttSrc: 'mockVttSrc',
          srtSrc: 'mockSrtSrc',
          edition: null
        })
      ).rejects.toThrow('Video with id mockVideoId not found')
    })
  })
})
