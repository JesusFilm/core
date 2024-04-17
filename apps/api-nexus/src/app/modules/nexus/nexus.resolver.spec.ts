import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Nexus } from '.prisma/api-nexus-client'

import { PrismaService } from '../../lib/prisma.service'

import { NexusResolver } from './nexus.resolver'

describe('NexusResolver', () => {
  let resolver: NexusResolver
  let prismaService: DeepMockProxy<PrismaService>

  const nexusExample: Nexus = {
    id: 'nexusId',
    name: 'Nexus Name',
    description: 'Nexus Description',
    status: 'published',
    createdAt: new Date(),
    deletedAt: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NexusResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<NexusResolver>(NexusResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('nexuses', () => {
    it('fetches accessible nexuses based on user ID and filters', async () => {
      prismaService.nexus.findMany.mockResolvedValue([nexusExample])
      const userId = 'userId'
      const filter = { ids: ['nexusId'], limit: 1, orderByRecent: true }
      const nexuses = await resolver.nexuses(userId, filter)
      expect(prismaService.nexus.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { id: { in: ['nexusId'] } },
            { userNexuses: { every: { userId } } },
            { status: 'published' }
          ]
        },
        take: 1,
        orderBy: { createdAt: 'desc' }
      })
      expect(nexuses).toEqual([nexusExample])
    })
  })

  describe('nexus', () => {
    it('fetches a single nexus by ID for the current user', async () => {
      prismaService.nexus.findFirst.mockResolvedValue(nexusExample)
      const userId = 'userId'
      const nexus = await resolver.nexus(userId, 'nexusId')
      expect(prismaService.nexus.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'nexusId',
          userNexuses: { every: { userId } },
          status: 'published'
        }
      })
      expect(nexus).toEqual(nexusExample)
    })
  })

  describe('nexusCreate', () => {
    it('creates a nexus with the given input and associates it with the user', async () => {
      prismaService.nexus.create.mockResolvedValue(nexusExample)
      const userId = 'userId'
      const input = {
        name: 'New Nexus',
        description: 'A new nexus description'
      }
      const nexus = await resolver.nexusCreate(userId, input)
      expect(prismaService.nexus.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input)
      })
      expect(prismaService.userNexus.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          nexusId: nexusExample.id,
          role: 'owner'
        })
      })
      expect(nexus).toEqual(nexusExample)
    })
  })

  describe('nexusUpdate', () => {
    it('updates a nexus with the given input for the current user', async () => {
      prismaService.nexus.update.mockResolvedValue(nexusExample)
      const userId = 'userId'
      const input = {
        name: 'Updated Nexus Name',
        description: 'Updated description'
      }
      const nexus = await resolver.nexusUpdate(userId, 'nexusId', input)
      expect(prismaService.nexus.update).toHaveBeenCalledWith({
        where: { id: 'nexusId', userNexuses: { every: { userId } } },
        data: input
      })
      expect(nexus).toEqual(nexusExample)
    })
  })

  describe('nexusDelete', () => {
    it('deletes a nexus by setting its status to deleted for the current user', async () => {
      prismaService.nexus.update.mockResolvedValue({
        ...nexusExample,
        status: 'deleted'
      })
      const userId = 'userId'
      const result = await resolver.nexusDelete(userId, 'nexusId')
      expect(prismaService.nexus.update).toHaveBeenCalledWith({
        where: { id: 'nexusId', userNexuses: { every: { userId } } },
        data: { status: 'deleted' }
      })
      expect(result).toBe(true)
    })
  })
})
