import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  CustomDomain,
  Journey,
  JourneyCollection,
  Prisma,
  UserTeamRole
} from '@core/prisma/journeys/client'

import {
  JourneyCollectionCreateInput,
  JourneyCollectionUpdateInput
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyCollectionResolver } from './journeyCollection.resolver'

describe('JourneyCollectionResolver', () => {
  let resolver: JourneyCollectionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyCollectionResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<JourneyCollectionResolver>(JourneyCollectionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  const journeyCollection: JourneyCollection = {
    id: 'journeyCollectionId',
    teamId: 'teamId',
    title: null
  }
  const journeyCollectionWithUserTeam = {
    ...journeyCollection,
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('journeyCollection', () => {
    it('should return a journey collection', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollectionWithUserTeam
      )
      expect(
        await resolver.journeyCollection('journeyCollectionId', ability)
      ).toEqual(journeyCollectionWithUserTeam)
      expect(prismaService.journeyCollection.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyCollectionId' },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should handle not found', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyCollection('journeyCollectionId', ability)
      ).rejects.toThrow('journey collection not found')
    })

    it('should handle not allowed', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollection
      )
      await expect(
        resolver.journeyCollection('journeyCollectionId', ability)
      ).rejects.toThrow('user is not allowed to read journey collection')
    })
  })

  describe('journeyCollections', () => {
    it('should return journey collections', async () => {
      const accessibleJourneyCollections: Prisma.JourneyCollectionWhereInput = {
        OR: [{}]
      }
      prismaService.journeyCollection.findMany.mockResolvedValue([
        journeyCollection
      ])
      expect(
        await resolver.journeyCollections(
          'teamId',
          accessibleJourneyCollections
        )
      ).toEqual([journeyCollection])
      expect(prismaService.journeyCollection.findMany).toHaveBeenCalledWith({
        where: { AND: [{ OR: [{}] }, { teamId: 'teamId' }] }
      })
    })
  })

  describe('journeyCollectionCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should create a journey collection', async () => {
      const input: JourneyCollectionCreateInput = {
        id: 'journeyCollectionId',
        teamId: 'teamId',
        title: 'title'
      }
      prismaService.journeyCollection.create.mockResolvedValue(
        journeyCollectionWithUserTeam
      )
      expect(await resolver.journeyCollectionCreate(input, ability)).toEqual(
        journeyCollectionWithUserTeam
      )
      expect(prismaService.journeyCollection.create).toHaveBeenCalledWith({
        data: {
          id: 'journeyCollectionId',
          team: { connect: { id: 'teamId' } },
          title: 'title'
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should create a journey collection with advanced input', async () => {
      const input: JourneyCollectionCreateInput = {
        id: 'journeyCollectionId',
        teamId: 'teamId',
        title: 'title',
        journeyIds: ['journeyId1', 'journeyOutsideTeamId', 'journeyId2']
      }
      prismaService.journeyCollection.create.mockResolvedValue(
        journeyCollectionWithUserTeam
      )
      prismaService.journey.findMany.mockResolvedValue([
        { id: 'journeyId2' } as unknown as Journey,
        { id: 'journeyId1' } as unknown as Journey
      ])
      expect(await resolver.journeyCollectionCreate(input, ability)).toEqual(
        journeyCollectionWithUserTeam
      )
      expect(prismaService.journeyCollection.create).toHaveBeenCalledWith({
        data: {
          id: 'journeyCollectionId',
          team: { connect: { id: 'teamId' } },
          title: 'title',
          journeyCollectionJourneys: {
            createMany: {
              data: [
                { order: 0, journeyId: 'journeyId1' },
                { order: 1, journeyId: 'journeyId2' }
              ]
            }
          }
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should handle not allowed', async () => {
      const input: JourneyCollectionCreateInput = {
        id: 'journeyCollectionId',
        teamId: 'teamId',
        title: 'title'
      }
      prismaService.journeyCollection.create.mockResolvedValue(
        journeyCollection
      )
      await expect(
        resolver.journeyCollectionCreate(input, ability)
      ).rejects.toThrow('user is not allowed to create journey collection')
    })
  })

  describe('journeyCollectionUpdate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should update a journey collection', async () => {
      const input: JourneyCollectionUpdateInput = {
        title: 'title'
      }
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollectionWithUserTeam
      )
      prismaService.journeyCollection.update.mockResolvedValueOnce(
        journeyCollection
      )

      expect(
        await resolver.journeyCollectionUpdate(
          'journeyCollectionId',
          input,
          ability
        )
      ).toEqual(journeyCollection)
      expect(prismaService.journeyCollection.update).toHaveBeenCalledWith({
        where: { id: 'journeyCollectionId' },
        data: { title: 'title' }
      })
    })

    it('should update a journey collection with advanced input', async () => {
      const input: JourneyCollectionUpdateInput = {
        title: 'title',
        journeyIds: ['journeyId1', 'journeyOutsideTeamId', 'journeyId2']
      }
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollectionWithUserTeam
      )
      prismaService.journeyCollection.update.mockResolvedValueOnce(
        journeyCollection
      )
      prismaService.journey.findMany.mockResolvedValue([
        { id: 'journeyId2' } as unknown as Journey,
        { id: 'journeyId1' } as unknown as Journey
      ])

      expect(
        await resolver.journeyCollectionUpdate(
          'journeyCollectionId',
          input,
          ability
        )
      ).toEqual(journeyCollection)
      expect(
        prismaService.journeyCollectionJourneys.createMany
      ).toHaveBeenCalledWith({
        data: [
          {
            journeyCollectionId: 'journeyCollectionId',
            journeyId: 'journeyId1',
            order: 0
          },
          {
            journeyCollectionId: 'journeyCollectionId',
            journeyId: 'journeyId2',
            order: 1
          }
        ]
      })
      expect(prismaService.journeyCollection.update).toHaveBeenCalledWith({
        where: { id: 'journeyCollectionId' },
        data: { title: 'title' }
      })
    })

    it('should handle not found', async () => {
      const input: JourneyCollectionUpdateInput = {
        title: 'title'
      }
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyCollectionUpdate(
          'journeyCollectionDomainId',
          input,
          ability
        )
      ).rejects.toThrow('journey collection not found')
    })

    it('should handle not allowed', async () => {
      const input: JourneyCollectionUpdateInput = {
        title: 'title'
      }
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollection
      )
      await expect(
        resolver.journeyCollectionUpdate('journeyCollectionId', input, ability)
      ).rejects.toThrow('user is not allowed to update journey collection')
    })
  })

  describe('journeyCollectionDelete', () => {
    it('should delete a journey collection', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollectionWithUserTeam
      )
      prismaService.journeyCollection.delete.mockResolvedValueOnce(
        journeyCollection
      )
      expect(
        await resolver.journeyCollectionDelete('journeyCollectionId', ability)
      ).toEqual(journeyCollection)
      expect(prismaService.journeyCollection.delete).toHaveBeenCalledWith({
        where: { id: 'journeyCollectionId' }
      })
    })

    it('should handle not found', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.journeyCollectionDelete('journeyCollectionId', ability)
      ).rejects.toThrow('journey collection not found')
    })

    it('should handle not allowed', async () => {
      prismaService.journeyCollection.findUnique.mockResolvedValueOnce(
        journeyCollection
      )
      await expect(
        resolver.journeyCollectionDelete('customDomainId', ability)
      ).rejects.toThrow('user is not allowed to delete journey collection')
    })
  })

  describe('customDomains', () => {
    it('should return custom domains', async () => {
      const customDomain = { id: 'customDomainId' } as unknown as CustomDomain
      const journeyCollection: JourneyCollection = {
        id: 'journeyCollectionId',
        teamId: 'teamId',
        title: 'title'
      }
      prismaService.customDomain.findMany.mockResolvedValue([customDomain])

      expect(await resolver.customDomains(journeyCollection)).toEqual([
        customDomain
      ])
      expect(prismaService.customDomain.findMany).toHaveBeenCalledWith({
        where: { journeyCollectionId: 'journeyCollectionId' }
      })
    })
  })

  describe('journeys', () => {
    it('should return journeys', async () => {
      const journey = { id: 'journey' } as unknown as Journey
      const journeyCollection: JourneyCollection = {
        id: 'journeyCollectionId',
        teamId: 'teamId',
        title: 'title'
      }
      prismaService.journey.findMany.mockResolvedValue([journey])

      expect(await resolver.journeys(journeyCollection)).toEqual([journey])
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        where: {
          journeyCollectionJourneys: {
            some: { journeyCollectionId: 'journeyCollectionId' }
          }
        }
      })
    })
  })
})
