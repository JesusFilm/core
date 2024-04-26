import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../app/lib/prisma.service'

import { coreVideoVariantDownloadData } from './coreVideoVariantDownloadData'

describe('coreVideoVariantDownloadData', () => {
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

  it('should load video variant download to postgres', async () => {
    await coreVideoVariantDownloadData(
      {
        quality: 'low',
        size: 1234567,
        uri: 'www.example.com',
        videoVariantId: 'variantId'
      },
      prismaService
    )

    expect(prismaService.videoVariantDownload.upsert).toHaveBeenCalledWith({
      create: {
        quality: 'low',
        size: 1234567,
        url: 'www.example.com',
        videoVariantId: 'variantId'
      },
      update: {
        quality: 'low',
        size: 1234567,
        url: 'www.example.com',
        videoVariantId: 'variantId'
      },
      where: {
        quality_videoVariantId: {
          quality: 'low',
          videoVariantId: 'variantId'
        }
      }
    })
  })
})
