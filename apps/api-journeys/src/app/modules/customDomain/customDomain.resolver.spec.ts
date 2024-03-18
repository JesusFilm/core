import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainResolver } from './customDomain.resolver'
import { CustomDomainService } from './customDomain.service'

describe('CustomDomainResolver', () => {
  let resolver: CustomDomainResolver
  let prismaService: DeepMockProxy<PrismaService>
  let customDomainService: CustomDomainService

  const ability = {
    can: jest.fn().mockResolvedValue(true)
  } as unknown as AppAbility

  const customDomain = {
    id: 'cd',
    teamId: 'teamId',
    name: 'name.com',
    apexName: 'name.com',
    routeAllTeamJourneys: true,
    journeyCollectionId: null
  }

  const customDomainSpy = jest.fn().mockResolvedValue({
    id: 'cd',
    teamId: 'teamId',
    name: 'name.com',
    apexName: 'name.com',
    journeyCollectionId: null,
    routeAllTeamJourneys: true
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        CustomDomainResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: CustomDomainService,
          useValue: {
            customDomainCreate: customDomainSpy
          }
        }
      ]
    }).compile()
    resolver = module.get<CustomDomainResolver>(CustomDomainResolver)
    customDomainService = module.get<CustomDomainService>(CustomDomainService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('customDomain', () => {
    it('should return a custom domain', async () => {
      const id = 'id'
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      const result = await resolver.customDomain(id)

      expect(result).toEqual(customDomain)
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { id } })
    })
  })

  describe('customDomains', () => {
    it('should return custom domains', async () => {
      const teamId = 'teamId'
      const findManySpy = jest.spyOn(prismaService.customDomain, 'findMany')
      findManySpy.mockResolvedValue([customDomain])

      const result = await resolver.customDomains(teamId)

      expect(result).toEqual([customDomain])
      expect(findManySpy).toHaveBeenCalledWith({ where: { teamId } })
    })
  })

  describe('customDomainCreate', () => {
    it('should create a custom domain', async () => {
      const input = { name: 'name', teamId: 'teamId' }

      const result = await resolver.customDomainCreate(input, ability)

      expect(result).toEqual(customDomain)
      expect(customDomainSpy).toHaveBeenCalledWith(input, ability)
    })
  })

  describe('customDomainUpdate', () => {
    it('should update a custom domain', async () => {
      const input = {
        id: 'cd',
        name: 'name',
        teamId: 'teamId',
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      const updateSpy = jest.spyOn(prismaService.customDomain, 'update')
      updateSpy.mockResolvedValue(customDomain)

      const result = await resolver.customDomainUpdate(input, ability)

      expect(result).toEqual(customDomain)
      expect(updateSpy).toHaveBeenCalledWith({
        data: {
          ...omit(input, 'journeyCollectionId'),
          journeyCollection: {
            connect: { id: input.journeyCollectionId }
          }
        },
        where: { id: input.id }
      })
    })
  })

  describe('customDomainDelete', () => {
    it('should delete a custom domain', async () => {
      const id = 'id'
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      const deleteSpy = jest.spyOn(prismaService.customDomain, 'delete')
      deleteSpy.mockResolvedValue(customDomain)

      customDomainService.deleteVercelDomain = jest.fn().mockResolvedValue(true)

      const result = await resolver.customDomainDelete(id, ability)

      expect(result).toEqual(customDomain)
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id } })
    })
  })

  describe('verification', () => {
    it('should return a custom domain verification', async () => {
      const verification = {
        verified: true,
        verification: 'verification'
      }
      customDomainService.verifyVercelDomain = jest
        .fn()
        .mockResolvedValue(verification)

      const result = await resolver.verification(customDomain)

      expect(result).toEqual(verification)
    })
  })

  describe('journeyCollection', () => {
    it('should return a journey collection link', async () => {
      const result = resolver.journeyCollection({
        ...customDomain,
        journeyCollectionId: 'id'
      })
      expect(result).toEqual({ __typename: 'JourneyCollection', id: 'id' })
    })
  })
})
