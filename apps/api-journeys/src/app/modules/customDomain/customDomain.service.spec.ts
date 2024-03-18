import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CustomDomain } from '.prisma/api-journeys-client'

import { AppAbility } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainService } from './customDomain.service'

describe('customDomainService', () => {
  let service: CustomDomainService
  let prismaService: DeepMockProxy<PrismaService>
  let customDomain: CustomDomain

  const ability = {
    can: jest.fn().mockResolvedValue(true)
  } as unknown as AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDomainService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<CustomDomainService>(CustomDomainService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    customDomain = {
      id: 'id',
      teamId: 'teamId',
      name: 'example.name.com',
      apexName: 'name.com',
      journeyCollectionId: 'journeyCollectionId',
      routeAllTeamJourneys: true
    }
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('addVercelDomain', () => {
    it('should add a vercel domain', async () => {
      const result = await service.addVercelDomain('name.com')

      expect(result).toEqual({
        name: 'name.com',
        apexName: 'name.com',
        verification: [],
        verified: true
      })
    })
  })

  describe('customDomainCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should create a custom domain', async () => {
      const input = { name: 'name', teamId: 'teamId' }
      const createSpy = jest.spyOn(prismaService.customDomain, 'create')
      createSpy.mockResolvedValue(customDomain)

      const result = await service.customDomainCreate(input, ability)

      expect(result).toEqual({
        ...customDomain,
        verification: {
          verified: true,
          verification: []
        }
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          name: input.name,
          apexName: 'name',
          routeAllTeamJourneys: undefined,
          team: { connect: { id: input.teamId } }
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should handle alternative input', async () => {
      const input = {
        name: 'name',
        teamId: 'teamId',
        routeAllTeamJourneys: undefined,
        journeyCollectionId: 'journeyCollectionId'
      }
      const createSpy = jest.spyOn(prismaService.customDomain, 'create')
      createSpy.mockResolvedValue(customDomain)

      const result = await service.customDomainCreate(input, ability)

      expect(result).toEqual({
        ...customDomain,
        verification: {
          verified: true,
          verification: []
        }
      })
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          name: input.name,
          apexName: 'name',
          team: { connect: { id: input.teamId } },
          journeyCollection: {
            connect: { id: input.journeyCollectionId }
          }
        },
        include: { team: { include: { userTeams: true } } }
      })
    })
  })

  describe('verifyVercelDomain', () => {
    it('should verify a vercel domain', async () => {
      const result = await service.verifyVercelDomain('name.com')

      expect(result).toEqual({
        name: 'name.com',
        apexName: 'name.com',
        verification: [],
        verified: true
      })
    })
  })

  describe('deleteVercelDomain', () => {
    it('should delete a vercel domain', async () => {
      const result = await service.deleteVercelDomain('name.com')

      expect(result).toBe(true)
    })
  })
})
