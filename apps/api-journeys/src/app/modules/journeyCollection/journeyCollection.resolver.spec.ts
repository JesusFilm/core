import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'
import { CustomDomainService } from '../customDomain/customDomain.service'

import { JourneyCollectionResolver } from './journeyCollection.resolver'

describe('JourneyCollectionResolver', () => {
  let resolver: JourneyCollectionResolver,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyCollectionResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: CustomDomainService,
          useValue: {
            customDomainCreate: jest.fn()
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
    it('should create a journey collection', async () => {
      const input = {
        id: 'id',
        teamId: 'teamId',
        title: 'title',
        customDomain: 'customDomain',
        journeyIds: ['journeyId']
      }
      const collection = { id: 'id', teamId: 'teamId', title: 'title' }
      const createSpy = jest.spyOn(prismaService.journeyCollection, 'create')
      createSpy.mockResolvedValue(collection)

      const result = await resolver.journeyCollectionCreate(input, {} as any)

      expect(result).toEqual(collection)
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          id: input.id,
          team: { connect: { id: input.teamId } },
          title: input.title,
          customDomain: input.customDomain,
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
})
