import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoSnippet } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoSnippetsService } from './importerVideoSnippets.service'

describe('ImporterVideoSnippetsService', () => {
  let service: ImporterVideoSnippetsService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoSnippetsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoSnippetsService>(
      ImporterVideoSnippetsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video snippet', async () => {
      prismaService.videoSnippet.findUnique.mockResolvedValueOnce({
        id: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: '529',
        primary: true
      } as unknown as VideoSnippet)
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        otherData: 'stuff'
      })
      expect(prismaService.videoSnippet.findUnique).toHaveBeenCalledWith({
        where: {
          videoId_languageId: {
            languageId: '529',
            videoId: 'mockVideoId'
          }
        }
      })
      expect(prismaService.videoSnippet.update).toHaveBeenCalledWith({
        data: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        where: {
          videoId_languageId: {
            languageId: '529',
            videoId: 'mockVideoId'
          }
        }
      })
    })

    it('should not update video snippets when not found', async () => {
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        otherData: 'stuff'
      })
      expect(prismaService.videoSnippet.findUnique).toHaveBeenCalledWith({
        where: {
          videoId_languageId: {
            languageId: '529',
            videoId: 'mockVideoId'
          }
        }
      })
      expect(prismaService.videoSnippet.update).not.toHaveBeenCalled()
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
  })
})
