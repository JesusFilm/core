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

  let ability: AppAbility

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
    ability = {
      can: jest.fn().mockResolvedValue(true)
    } as unknown as AppAbility

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

    it('should handle null values', async () => {
      const input = {
        id: 'cd',
        name: null,
        teamId: 'teamId',
        routeAllTeamJourneys: null,
        journeyCollectionId: null
      }
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      const updateSpy = jest.spyOn(prismaService.customDomain, 'update')
      updateSpy.mockResolvedValue(customDomain)

      const result = await resolver.customDomainUpdate(input, ability)

      expect(result).toEqual(customDomain)
      expect(updateSpy).toHaveBeenCalledWith({
        data: {
          id: input.id,
          teamId: input.teamId,
          journeyCollection: {
            connect: { id: undefined }
          }
        },
        where: { id: input.id }
      })
    })

    it('should handle not found', () => {
      const input = {
        id: 'cd',
        name: 'name',
        teamId: 'teamId',
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(null)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.customDomainUpdate(input, ability)).rejects.toThrow(
        'Custom domain not found'
      )
    })

    it('should handle not allowed', () => {
      const input = {
        id: 'cd',
        name: 'name',
        teamId: 'teamId',
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      ability.can = jest.fn().mockImplementation(() => false)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.customDomainUpdate(input, ability)).rejects.toThrow(
        'user is not allowed to update custom domain'
      )
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

    it('should handle not found', () => {
      const id = 'id'
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(null)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.customDomainDelete(id, ability)).rejects.toThrow(
        'Custom domain not found'
      )
    })

    it('should handle not allowed', () => {
      const id = 'id'
      const findUniqueSpy = jest.spyOn(prismaService.customDomain, 'findUnique')
      findUniqueSpy.mockResolvedValue(customDomain)

      ability.can = jest.fn().mockImplementation(() => false)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(resolver.customDomainDelete(id, ability)).rejects.toThrow(
        'user is not allowed to delete custom domain'
      )
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

    it('should handle null', async () => {
      const result = resolver.journeyCollection({
        ...customDomain,
        journeyCollectionId: null
      })
      expect(result).toBeNull()
    })
  })

  describe('resolveReference', () => {
    it('should resolve a custom domain reference', async () => {
      const customDomainSpy = jest.spyOn(resolver, 'customDomain')
      customDomainSpy.mockResolvedValue(customDomain)

      const result = await resolver.resolveReference({
        __typename: 'CustomDomain',
        id: 'id'
      })

      expect(result).toEqual(customDomain)
      expect(customDomainSpy).toHaveBeenCalledWith('id')
    })
  })
})
