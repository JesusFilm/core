import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../app/lib/prisma.service'

import { coreVideoTitleArclightData } from './coreVideoTitleArclightData'

describe('coreVideoTitleArclightData', () => {
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  it('should load video title to postgres', async () => {
    await coreVideoTitleArclightData(
      {
        title: 'Mock Title',
        languageId: 529,
        primary: 0,
        videoId: 'videoId'
      },
      prismaService
    )

    expect(prismaService.videoTitle.upsert).toHaveBeenCalledWith({
      create: {
        languageId: '529',
        primary: true,
        value: 'Mock Title',
        videoId: 'videoId'
      },
      update: {
        languageId: '529',
        primary: true,
        value: 'Mock Title',
        videoId: 'videoId'
      },
      where: { videoId_languageId: { languageId: '529', videoId: 'videoId' } }
    })
  })
})
