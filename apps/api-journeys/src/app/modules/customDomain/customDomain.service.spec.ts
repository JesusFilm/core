import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'
import fetch, { Response } from 'node-fetch'

import { CustomDomain } from '.prisma/api-journeys-client'

import { AppAbility } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainService } from './customDomain.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

const createResult = {
  name: 'name.com',
  apexName: 'name.com',
  verification: [],
  verified: true
}

const configurationResult = {
  acceptedChallenges: ['http-01', 'dns-01'],
  configuredBy: 'http',
  misconfigured: false
}

describe('customDomainService', () => {
  let service: CustomDomainService
  let prismaService: DeepMockProxy<PrismaService>
  let customDomain: CustomDomain

  const ability = {
    can: jest.fn().mockResolvedValue(true)
  } as unknown as AppAbility

  const originalEnv = clone(process.env)

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
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('addVercelDomain', () => {
    it('should add a vercel domain locally', async () => {
      const result = await service.addVercelDomain('name.com')

      expect(result).toEqual(createResult)
    })

    it('should add a vercel domain in deployment', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(createResult)
      } as unknown as Response)

      const result = await service.addVercelDomain('name.com')

      expect(result).toEqual(createResult)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.vercel.com/v10/projects/projectId/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          body: JSON.stringify({
            name: 'name.com'
          }),
          headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
          method: 'POST'
        }
      )
    })

    it('should throw an error if the response is not ok', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            error: { message: 'error', code: 'error_code' }
          }),
        status: 409
      } as unknown as Response)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.addVercelDomain('name.com')).rejects.toThrow('error')
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
    it('should verify a vercel domain locally', async () => {
      const result = await service.verifyVercelDomain('name.com')

      expect(result).toEqual(createResult)
    })

    it('should verify a vercel domain in deployment', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(createResult)
      } as unknown as Response)

      const result = await service.verifyVercelDomain('name.com')

      expect(result).toEqual(createResult)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.vercel.com/v9/projects/projectId/domains/name.com/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
          method: 'POST'
        }
      )
    })

    it('should throw an error if the response is not ok', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 409,
        json: async () =>
          await Promise.resolve({
            error: { message: 'error', code: 'error_code' }
          })
      } as unknown as Response)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.verifyVercelDomain('name.com')).rejects.toThrow('error')
    })
  })

  describe('getVercelDomainConfiguration', () => {
    it('should get verification status of a vercel domain locally', async () => {
      const result = await service.getVercelDomainConfiguration('name.com')

      expect(result).toEqual(configurationResult)
    })

    it('should get configuration of a vercel domain in deployment', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(configurationResult)
      } as unknown as Response)

      const result = await service.getVercelDomainConfiguration('name.com')

      expect(result).toEqual(configurationResult)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.vercel.com/v6/domains/name.com/config?strict=true&teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
          method: 'GET'
        }
      )
    })
  })

  describe('deleteVercelDomain', () => {
    it('should delete a vercel domain locally', async () => {
      const result = await service.deleteVercelDomain('name.com')

      expect(result).toBe(true)
    })

    it('should delete a vercel domain in deployment', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve({})
      } as unknown as Response)

      const result = await service.deleteVercelDomain('name.com')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.vercel.com/v9/projects/projectId/domains/name.com?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
          method: 'DELETE'
        }
      )
    })

    it('should throw an error if the response is not ok', async () => {
      process.env = {
        ...originalEnv,
        VERCEL_TOKEN: 'abc',
        VERCEL_TEAM_ID: 'teamId',
        VERCEL_JOURNEYS_PROJECT_ID: 'projectId',
        GIT_BRANCH: 'main'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 408,
        json: async () =>
          await Promise.resolve({
            error: { message: 'error', code: 'error_code' }
          })
      } as unknown as Response)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.deleteVercelDomain('name.com')).rejects.toThrow('error')
    })
  })

  describe('isDomainValid', () => {
    it('should return true for valid domain', () => {
      const result = service.isDomainValid('jesusfilmtestdomain.online')

      expect(result).toBe(true)
    })

    it('should return false for invalid domain', () => {
      const result = service.isDomainValid('name')

      expect(result).toBe(false)
    })
  })
})
