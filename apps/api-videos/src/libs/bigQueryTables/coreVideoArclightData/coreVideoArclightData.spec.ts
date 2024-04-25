import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../app/lib/prisma.service'

import { coreVideoArclightData } from './coreVideoArclightData'

describe('coreVideoArclightData', () => {
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

  it('should fetch from prisma', async () => {
    prismaService.video.findMany.mockResolvedValue([
      { slug: 'slug', id: 'id' } as unknown as never
    ])
    prismaService.videoTitle.findUnique.mockResolvedValue({
      id: 'videoTitleId',
      value: 'mockVIdeoTitle',
      languageId: '529',
      primary: true,
      videoId: 'videoId'
    })
    await coreVideoArclightData(
      {
        id: 'id',
        primaryLanguageId: 529,
        label: 'segment',
        image: 'imageURLHigh',
        videoStill: 'videoStill',
        thumbnail: 'thumbnail',
        mobile_cinematic_high: 'imageURLHigh',
        mobile_cinematic_low: 'imageURLlow',
        mobile_cinematic_very_low: 'imageURLveryLow'
      },
      prismaService
    )
    expect(prismaService.video.findMany).toHaveBeenCalled()
    expect(prismaService.videoTitle.findUnique).toHaveBeenCalled()
    expect(prismaService.video.upsert).toHaveBeenCalledWith({
      create: {
        id: 'id',
        image: 'imageURLHigh',
        label: 'segment',
        noIndex: false,
        primaryLanguageId: '529',
        slug: 'mockvideotitle'
      },
      update: {
        id: 'id',
        image: 'imageURLHigh',
        label: 'segment',
        noIndex: false,
        primaryLanguageId: '529',
        slug: 'mockvideotitle'
      },
      where: {
        id: 'id'
      }
    })
  })
})
