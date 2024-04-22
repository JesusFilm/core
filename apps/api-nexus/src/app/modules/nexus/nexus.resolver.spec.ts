import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'

import { Nexus, NexusStatus, Prisma } from '.prisma/api-nexus-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { NexusResolver } from './nexus.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NexusResolver', () => {
  let resolver: NexusResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const nexus: Nexus = {
    id: 'nexusId',
    name: 'Nexus Name',
    description: 'Nexus Description',
    status: 'published',
    createdAt: new Date(),
    deletedAt: null
  }
  const nexusWithUserNexus = {
    ...nexus,
    userNexuses: [{ userId: 'userId', role: 'owner' }]
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
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
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('nexuses', () => {
    const accessibleNexuses: Prisma.NexusWhereInput = { OR: [{}] }

    beforeEach(() => {
      prismaService.nexus.findMany.mockResolvedValueOnce([nexus])
    })

    it('returns nexuses', async () => {
      expect(await resolver.nexuses(accessibleNexuses)).toEqual([nexus])
      expect(prismaService.nexus.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleNexuses, {}]
        }
      })
    })

    it('returns nexuses with filter', async () => {
      const filter = { ids: ['nexusId'] }
      expect(await resolver.nexuses(accessibleNexuses, filter)).toEqual([nexus])
      expect(prismaService.nexus.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleNexuses, { id: { in: ['nexusId'] } }]
        }
      })
    })

    it('returns nexuses with take', async () => {
      const filter = { limit: 1 }
      expect(await resolver.nexuses(accessibleNexuses, filter)).toEqual([nexus])
      expect(prismaService.nexus.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleNexuses, {}]
        },
        take: 1
      })
    })

    it('returns nexuses with orderBy', async () => {
      const filter = { orderByRecent: true }
      expect(await resolver.nexuses(accessibleNexuses, filter)).toEqual([nexus])
      expect(prismaService.nexus.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleNexuses, {}]
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('nexus', () => {
    it('returns nexus', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexusWithUserNexus)
      expect(await resolver.nexus(ability, 'nexusId')).toEqual(
        nexusWithUserNexus
      )
      expect(prismaService.nexus.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'nexusId'
        },
        include: { userNexuses: true }
      })
    })

    it('throws error if not found', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.nexus(ability, 'nexusId')).rejects.toThrow(
        'nexus not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexus)
      await expect(resolver.nexus(ability, 'nexusId')).rejects.toThrow(
        'user is not allowed to view nexus'
      )
    })
  })

  describe('nexusCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a nexus', async () => {
      prismaService.nexus.create.mockResolvedValueOnce(nexus)
      prismaService.nexus.findUnique.mockResolvedValue(nexusWithUserNexus)
      mockUuidv4.mockReturnValueOnce('nexusId')
      expect(
        await resolver.nexusCreate(
          ability,
          {
            name: 'New Nexus',
            description: 'A new nexus description'
          },
          'userId'
        )
      ).toEqual(nexusWithUserNexus)
      expect(prismaService.nexus.create).toHaveBeenCalledWith({
        data: {
          description: 'A new nexus description',
          id: 'nexusId',
          name: 'New Nexus',
          status: 'published',
          userNexuses: {
            create: {
              role: 'owner',
              userId: 'userId'
            }
          }
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.nexus.create.mockResolvedValueOnce(nexus)
      prismaService.nexus.findUnique.mockResolvedValue(null)
      await expect(
        resolver.nexusCreate(
          ability,
          {
            name: 'New Nexus',
            description: 'A new nexus description'
          },
          'userId'
        )
      ).rejects.toThrow('nexus not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.nexus.create.mockResolvedValueOnce(nexus)
      prismaService.nexus.findUnique.mockResolvedValue(nexus)
      await expect(
        resolver.nexusCreate(
          ability,
          {
            name: 'New Nexus',
            description: 'A new nexus description'
          },
          'userId'
        )
      ).rejects.toThrow('user is not allowed to create nexus')
    })
  })

  describe('nexusUpdate', () => {
    it('updates a nexus', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexusWithUserNexus)
      prismaService.nexus.update.mockResolvedValueOnce(nexus)
      const input = {
        name: 'Updated Nexus Name',
        description: 'Updated description'
      }
      expect(await resolver.nexusUpdate(ability, 'nexusId', input)).toEqual(
        nexus
      )
      expect(prismaService.nexus.update).toHaveBeenCalledWith({
        where: { id: 'nexusId' },
        data: input
      })
    })

    it('updates a nexus with empty fields when not passed in', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexusWithUserNexus)
      await resolver.nexusUpdate(ability, 'nexusId', {
        name: null,
        description: null
      })
      expect(prismaService.nexus.update).toHaveBeenCalledWith({
        where: { id: 'nexusId' },
        data: {
          name: undefined,
          description: undefined
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexus)
      await expect(
        resolver.nexusUpdate(ability, 'nexusId', { name: 'new title' })
      ).rejects.toThrow('user is not allowed to update nexus')
    })

    it('throws error if not found', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.nexusUpdate(ability, 'nexusId', { name: 'new title' })
      ).rejects.toThrow('nexus not found')
    })
  })

  describe('nexusDelete', () => {
    it('deletes a nexus', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexusWithUserNexus)
      prismaService.nexus.update.mockResolvedValueOnce(nexus)
      expect(await resolver.nexusDelete(ability, 'nexusId')).toEqual(nexus)
      expect(prismaService.nexus.update).toHaveBeenCalledWith({
        where: { id: 'nexusId' },
        data: { status: NexusStatus.deleted }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(nexus)
      await expect(resolver.nexusDelete(ability, 'nexusId')).rejects.toThrow(
        'user is not allowed to delete nexus'
      )
    })

    it('throws error if not found', async () => {
      prismaService.nexus.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.nexusDelete(ability, 'nexusId')).rejects.toThrow(
        'nexus not found'
      )
    })
  })
})
