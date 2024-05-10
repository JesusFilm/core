import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { BatchStatus } from '.prisma/api-nexus-client'

import { PrismaService } from '../../lib/prisma.service'

import { BatchResolver } from './batch.resolver'

describe('BatchResolver', () => {
  let resolver: BatchResolver
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()

    resolver = module.get<BatchResolver>(BatchResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('batches', () => {
    it('should return an array of batches with average percentages', async () => {
      const userId = 'someUserId'
      const mockBatches = [
        {
          id: 'batch1',
          nexusId: 'nexus1',
          channelId: 'channel1',
          name: 'Batch 1',
          status: BatchStatus.completed,
          createdAt: new Date(),
          resources: [{ percent: 50 }, { percent: 100 }],
          averagePercent: 75
        }
      ]

      prismaService.batch.findMany.mockResolvedValue(mockBatches)

      const result = await resolver.batches(userId, {})

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'batch1',
            nexusId: 'nexus1',
            channelId: 'channel1',
            name: 'Batch 1',
            status: BatchStatus.completed,
            averagePercent: 75
          })
        ])
      )
      expect(prismaService.batch.findMany).toHaveBeenCalled()
    })
  })
})
