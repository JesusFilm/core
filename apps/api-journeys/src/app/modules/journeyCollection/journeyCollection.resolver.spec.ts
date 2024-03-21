import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CustomDomain } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { CustomDomainService } from '../customDomain/customDomain.service'

import { JourneyCollectionResolver } from './journeyCollection.resolver'

describe('JourneyCollectionResolver', () => {
  let resolver: JourneyCollectionResolver,
    prismaService: DeepMockProxy<PrismaService>

  const ability = {
    can: jest.fn().mockResolvedValue(true)
  } as unknown as AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyCollectionResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: CustomDomainService,
          useValue: {
            customDomainCreate: jest.fn().mockResolvedValue({
              id: 'cd',
              teamId: 'teamId',
              name: 'example.name.com',
              apexName: 'name.com',
              journeyCollectionId: 'id',
              routeAllTeamJourneys: true
            })
          }
        }
      ]
    }).compile()

    resolver = module.get<JourneyCollectionResolver>(JourneyCollectionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('journeyCollection', () => {
    it('should return a journey collection', async () => {
      const id = 'id'
      const journeyCollection = { id, teamId: 'teamId', title: '' }
      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(journeyCollection)

      const result = await resolver.journeyCollection(id)

      expect(result).toEqual(journeyCollection)
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { id } })
    })
  })

  describe('journeyCollections', () => {
    it('should return journey collections', async () => {
      const teamId = 'teamId'
      const journeyCollections = [{ id: 'id', teamId, title: '' }]
      const findManySpy = jest.spyOn(
        prismaService.journeyCollection,
        'findMany'
      )
      findManySpy.mockResolvedValue(journeyCollections)

      const result = await resolver.journeyCollections(teamId)

      expect(result).toEqual(journeyCollections)
      expect(findManySpy).toHaveBeenCalledWith({ where: { teamId } })
    })
  })

  describe('journeyCollectionCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should create a journey collection', async () => {
      const input = {
        id: 'id',
        teamId: 'teamId',
        title: 'title',
        customDomain: {
          teamId: 'teamId',
          name: 'name.com'
        },
        journeyIds: ['journeyId']
      }
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }

      const createSpy = jest.spyOn(prismaService.journeyCollection, 'create')
      createSpy.mockResolvedValue(collection)

      const updateSpy = jest.spyOn(prismaService.journeyCollection, 'update')
      updateSpy.mockResolvedValue(collection)

      const result = await resolver.journeyCollectionCreate(input, ability)

      expect(result).toEqual(collection)
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          id: input.id,
          team: { connect: { id: input.teamId } },
          title: input.title,
          journeyCollectionJourneys: {
            createMany: {
              data: [{ order: 0, journeyId: input.journeyIds[0] }]
            }
          }
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should create a simplified journey collection', async () => {
      const input = {
        id: 'id',
        teamId: 'teamId',
        title: 'title'
      }
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }

      const createSpy = jest.spyOn(prismaService.journeyCollection, 'create')
      createSpy.mockResolvedValue(collection)

      const result = await resolver.journeyCollectionCreate(input, ability)

      expect(result).toEqual(collection)
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          id: input.id,
          team: { connect: { id: input.teamId } },
          title: input.title
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should handle not can', () => {
      const input = {
        id: 'id',
        teamId: 'teamId',
        title: 'title',
        customDomain: {
          teamId: 'teamId',
          name: 'name.com'
        },
        journeyIds: ['journeyId']
      }
      const abilitySpy = jest.spyOn(ability, 'can')
      abilitySpy.mockImplementationOnce(() => false)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.journeyCollectionCreate(input, ability)).rejects.toThrow(
        'user is not allowed to create journey collection'
      )
    })
  })

  describe('journeyCollectionUpdate', () => {
    it('should update a journey collection', async () => {
      const input = { id: 'id', title: 'title' }
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }
      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(collection)
      const updateSpy = jest.spyOn(prismaService.journeyCollection, 'update')
      updateSpy.mockResolvedValue(collection)

      const result = await resolver.journeyCollectionUpdate(input, ability)

      expect(result).toEqual(collection)
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: input.id },
        include: { team: { include: { userTeams: true } } }
      })
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: input.id },
        data: { title: input.title }
      })
    })

    it('should handle journeys changes', async () => {
      const input = {
        id: 'id',
        title: 'title',
        journeyIds: ['journeyId']
      }
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }

      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(collection)

      const updateSpy = jest.spyOn(prismaService.journeyCollection, 'update')
      updateSpy.mockResolvedValue(collection)

      const deleteSpy = jest.spyOn(
        prismaService.journeyCollectionJourneys,
        'deleteMany'
      )
      deleteSpy.mockResolvedValue({ count: 0 })

      const createSpy = jest.spyOn(
        prismaService.journeyCollectionJourneys,
        'createMany'
      )
      createSpy.mockResolvedValue({ count: 1 })

      const result = await resolver.journeyCollectionUpdate(input, ability)

      expect(result).toEqual(collection)
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: input.id },
        include: { team: { include: { userTeams: true } } }
      })
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          title: input.title
        }
      })
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { journeyCollectionId: input.id }
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: [
          {
            order: 0,
            journeyId: input.journeyIds[0],
            journeyCollectionId: input.id
          }
        ]
      })
    })

    it('should handle null', () => {
      const input = { id: 'id', title: 'title' }
      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(null)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.journeyCollectionUpdate(input, ability)).rejects.toThrow(
        'journey collection not found'
      )
    })

    it('should handle not can', () => {
      const input = { id: 'id', title: 'title' }

      const journeyCollectionSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      journeyCollectionSpy.mockResolvedValue({
        id: 'id',
        teamId: 'teamId',
        title: 'title'
      })

      const abilitySpy = jest.spyOn(ability, 'can')
      abilitySpy.mockImplementationOnce(() => false)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.journeyCollectionUpdate(input, ability)).rejects.toThrow(
        'user is not allowed to update journey collection'
      )
    })
  })

  describe('customDomains', () => {
    it('should return custom domains', async () => {
      const teamId = 'teamId'
      const customDomains = [{ id: 'cd', teamId } as unknown as CustomDomain]
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }

      const findManySpy = jest.spyOn(prismaService.customDomain, 'findMany')
      findManySpy.mockResolvedValue(customDomains)

      const result = await resolver.customDomains(collection)

      expect(result).toEqual(customDomains)
      expect(findManySpy).toHaveBeenCalledWith({
        where: { journeyCollectionId: 'id' }
      })
    })
  })

  describe('journeyCollectionDelete', () => {
    it('should delete a journey collection', async () => {
      const id = 'id'
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }
      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(collection)
      const deleteSpy = jest.spyOn(prismaService.journeyCollection, 'delete')
      deleteSpy.mockResolvedValue(collection)

      const result = await resolver.journeyCollectionDelete(id, ability)

      expect(result).toEqual(collection)
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id } })
    })

    it('should handle null', () => {
      const id = 'id'
      const findUniqueSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      findUniqueSpy.mockResolvedValue(null)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.journeyCollectionDelete(id, ability)).rejects.toThrow(
        'journey collection not found'
      )
    })

    it('should handle not can', () => {
      const id = 'id'
      const journeyCollectionSpy = jest.spyOn(
        prismaService.journeyCollection,
        'findUnique'
      )
      journeyCollectionSpy.mockResolvedValue({
        id: 'id',
        teamId: 'teamId',
        title: 'title'
      })

      const abilitySpy = jest.spyOn(ability, 'can')
      abilitySpy.mockImplementationOnce(() => false)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.journeyCollectionDelete(id, ability)).rejects.toThrow(
        'user is not allowed to delete journey collection'
      )
    })
  })

  describe('journeys', () => {
    it('should return journeys', async () => {
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }
      const findManySpy = jest.spyOn(
        prismaService.journeyCollectionJourneys,
        'findMany'
      )
      findManySpy.mockResolvedValue([])

      const result = await resolver.journeys(collection)

      expect(result).toEqual([])
      expect(findManySpy).toHaveBeenCalledWith({
        where: { journeyCollectionId: 'id' },
        include: { journey: true }
      })
    })
  })

  it('should return empty array', async () => {
    const collection = { id: 'id', teamId: 'teamId', title: 'title' }
    const findManySpy = jest.spyOn(
      prismaService.journeyCollectionJourneys,
      'findMany'
    )
    findManySpy.mockResolvedValue([])

    const result = await resolver.journeys(collection)

    expect(result).toEqual([])
    expect(findManySpy).toHaveBeenCalledWith({
      where: { journeyCollectionId: 'id' },
      include: { journey: true }
    })
  })
})
