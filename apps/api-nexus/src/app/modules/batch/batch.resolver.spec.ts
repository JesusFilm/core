import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { BatchStatus } from '.prisma/api-nexus-client'

import { PrismaService } from '../../lib/prisma.service'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { BatchResolver } from './batch.resolver'

describe('BatchResolver', () => {
  let resolver: BatchResolver
  let ability: AppAbility
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
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('batch', () => {
    const userId = 'someUserId'
    const batch = {
      id: 'batch1',
      name: 'Batch 1',
      status: BatchStatus.completed,
      totalTasks: 2,
      completedTasks: 2,
      failedTasks: 0,
      progress: 75.0,
      updatedAt: new Date(),
      createdAt: new Date()
    }

    beforeEach(() => {
      return prismaService.batch.findMany.mockResolvedValueOnce([batch])
    })

    it('returns batche', async () => {
      expect(await resolver.batch(ability, userId, 'batch1')).toBeNull()
    })
  })
})
