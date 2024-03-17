import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

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
  })
})
