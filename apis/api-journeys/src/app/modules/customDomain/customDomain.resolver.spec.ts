import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  CustomDomain,
  Journey,
  JourneyCollection,
  Prisma,
  Team,
  UserTeamRole
} from '@core/prisma/journeys/client'

import {
  CustomDomainCreateInput,
  CustomDomainUpdateInput
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'
import { QrCodeService } from '../qrCode/qrCode.service'

import { CustomDomainResolver } from './customDomain.resolver'
import { CustomDomainService } from './customDomain.service'

describe('CustomDomainResolver', () => {
  let resolver: CustomDomainResolver,
    service: DeepMockProxy<CustomDomainService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const customDomain: CustomDomain = {
    id: 'customDomainId',
    teamId: 'teamId',
    name: 'name.com',
    apexName: 'name.com',
    routeAllTeamJourneys: true,
    journeyCollectionId: null
  }
  const customDomainWithUserTeam = {
    ...customDomain,
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        CustomDomainResolver,
        {
          provide: CustomDomainService,
          useValue: mockDeep<CustomDomainService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: QrCodeService,
          useValue: mockDeep<QrCodeService>()
        }
      ]
    }).compile()
    resolver = module.get<CustomDomainResolver>(CustomDomainResolver)
    service =
      module.get<DeepMockProxy<CustomDomainService>>(CustomDomainService)
    prismaService = module.get<DeepMockProxy<PrismaService>>(PrismaService)
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('customDomain', () => {
    it('should return a custom domain', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(
        customDomainWithUserTeam
      )
      expect(await resolver.customDomain('customDomainId', ability)).toEqual(
        customDomainWithUserTeam
      )
      expect(prismaService.customDomain.findUnique).toHaveBeenCalledWith({
        where: { id: 'customDomainId' },
        include: {
          team: {
            include: {
              userTeams: true,
              journeys: {
                include: {
                  userJourneys: true
                }
              }
            }
          }
        }
      })
    })

    it('should handle not found', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.customDomain('customDomainId', ability)
      ).rejects.toThrow('custom domain not found')
    })

    it('should handle not allowed', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(customDomain)
      await expect(
        resolver.customDomain('customDomainId', ability)
      ).rejects.toThrow('user is not allowed to read custom domain')
    })
  })

  describe('customDomains', () => {
    it('should return custom domains', async () => {
      const accessibleCustomDomains: Prisma.CustomDomainWhereInput = {
        OR: [{}]
      }
      prismaService.customDomain.findMany.mockResolvedValue([customDomain])
      expect(
        await resolver.customDomains('teamId', accessibleCustomDomains)
      ).toEqual([customDomain])
      expect(prismaService.customDomain.findMany).toHaveBeenCalledWith({
        where: { AND: [{ OR: [{}] }, { teamId: 'teamId' }] }
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
      const input: CustomDomainCreateInput = {
        name: 'www.example.com',
        teamId: 'teamId'
      }
      service.isDomainValid.mockReturnValueOnce(true)
      service.createVercelDomain.mockResolvedValue({
        name: 'www.example.com',
        apexName: 'example.com'
      })
      prismaService.customDomain.create.mockResolvedValue(
        customDomainWithUserTeam
      )
      expect(await resolver.customDomainCreate(input, ability)).toEqual(
        customDomainWithUserTeam
      )
    })

    it('should create a custom domain with advanced input', async () => {
      const input: CustomDomainCreateInput = {
        id: 'customDomainId',
        name: 'www.example.com',
        teamId: 'teamId',
        routeAllTeamJourneys: true,
        journeyCollectionId: 'journeyCollectionId'
      }
      service.isDomainValid.mockReturnValueOnce(true)
      service.createVercelDomain.mockResolvedValue({
        name: 'www.example.com',
        apexName: 'example.com'
      })
      prismaService.customDomain.create.mockResolvedValue(
        customDomainWithUserTeam
      )
      expect(await resolver.customDomainCreate(input, ability)).toEqual(
        customDomainWithUserTeam
      )
      expect(prismaService.customDomain.create).toHaveBeenCalledWith({
        data: {
          ...omit(input, ['teamId', 'journeyCollectionId']),
          apexName: 'example.com',
          team: { connect: { id: 'teamId' } },
          journeyCollection: {
            connect: { id: 'journeyCollectionId' }
          }
        },
        include: { team: { include: { userTeams: true } } }
      })
    })

    it('should handle invalid domain name', async () => {
      const input: CustomDomainCreateInput = {
        name: 'www.example.com',
        teamId: 'teamId'
      }
      service.isDomainValid.mockReturnValueOnce(false)
      await expect(resolver.customDomainCreate(input, ability)).rejects.toThrow(
        'custom domain has invalid domain name'
      )
    })

    it('should handle custom domain already exists', async () => {
      const input: CustomDomainCreateInput = {
        name: 'www.example.com',
        teamId: 'teamId'
      }
      service.isDomainValid.mockReturnValueOnce(true)
      service.createVercelDomain.mockResolvedValue({
        name: 'www.example.com',
        apexName: 'example.com'
      })
      prismaService.customDomain.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('', {
          code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED,
          clientVersion: ''
        })
      )
      await expect(resolver.customDomainCreate(input, ability)).rejects.toThrow(
        'custom domain already exists'
      )
    })

    it('should handle not allowed', async () => {
      const input: CustomDomainCreateInput = {
        name: 'www.example.com',
        teamId: 'teamId'
      }
      service.isDomainValid.mockReturnValueOnce(true)
      service.createVercelDomain.mockResolvedValue({
        name: 'www.example.com',
        apexName: 'example.com'
      })
      prismaService.customDomain.create.mockResolvedValue(customDomain)
      await expect(resolver.customDomainCreate(input, ability)).rejects.toThrow(
        'user is not allowed to create custom domain'
      )
    })
  })

  describe('customDomainUpdate', () => {
    it('should update a custom domain', async () => {
      const input: CustomDomainUpdateInput = {
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      prismaService.customDomain.findUnique.mockResolvedValueOnce(
        customDomainWithUserTeam
      )
      prismaService.customDomain.update.mockResolvedValueOnce(customDomain)

      expect(
        await resolver.customDomainUpdate('customDomainId', input, ability)
      ).toEqual(customDomain)
      expect(prismaService.customDomain.update).toHaveBeenCalledWith({
        data: {
          ...omit(input, 'journeyCollectionId'),
          journeyCollection: {
            connect: { id: input.journeyCollectionId }
          }
        },
        where: { id: 'customDomainId' }
      })
    })

    it('should handle null values', async () => {
      const input: CustomDomainUpdateInput = {
        routeAllTeamJourneys: null,
        journeyCollectionId: null
      }
      prismaService.customDomain.findUnique.mockResolvedValueOnce(
        customDomainWithUserTeam
      )
      prismaService.customDomain.update.mockResolvedValueOnce(customDomain)

      expect(
        await resolver.customDomainUpdate('customDomainId', input, ability)
      ).toEqual(customDomain)
      expect(prismaService.customDomain.update).toHaveBeenCalledWith({
        data: {
          routeAllTeamJourneys: undefined,
          journeyCollection: {
            connect: { id: undefined }
          }
        },
        where: { id: 'customDomainId' }
      })
    })

    it('should handle not found', async () => {
      const input: CustomDomainUpdateInput = {
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      prismaService.customDomain.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.customDomainUpdate('customDomainId', input, ability)
      ).rejects.toThrow('custom domain not found')
    })

    it('should handle not allowed', async () => {
      const input: CustomDomainUpdateInput = {
        routeAllTeamJourneys: true,
        journeyCollectionId: 'id'
      }
      prismaService.customDomain.findUnique.mockResolvedValueOnce(customDomain)
      await expect(
        resolver.customDomainUpdate('customDomainId', input, ability)
      ).rejects.toThrow('user is not allowed to update custom domain')
    })
  })

  describe('customDomainDelete', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should delete a custom domain', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(
        customDomainWithUserTeam
      )
      prismaService.customDomain.delete.mockResolvedValueOnce(customDomain)
      service.deleteVercelDomain.mockResolvedValue(true)
      expect(
        await resolver.customDomainDelete('customDomainId', ability)
      ).toEqual(customDomainWithUserTeam)
      expect(prismaService.customDomain.delete).toHaveBeenCalledWith({
        where: { id: 'customDomainId' }
      })
    })

    it('should handle not found', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.customDomainDelete('customDomainId', ability)
      ).rejects.toThrow('custom domain not found')
    })

    it('should handle not allowed', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(customDomain)
      await expect(
        resolver.customDomainDelete('customDomainId', ability)
      ).rejects.toThrow('user is not allowed to delete custom domain')
    })
  })

  describe('customDomainCheck', () => {
    it('should return a custom domain check', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(
        customDomainWithUserTeam
      )
      service.checkVercelDomain.mockResolvedValue({
        configured: true,
        verified: true
      })
      expect(
        await resolver.customDomainCheck('customDomainId', ability)
      ).toEqual({
        configured: true,
        verified: true
      })
    })

    it('should handle not found', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.customDomainCheck('customDomainId', ability)
      ).rejects.toThrow('custom domain not found')
    })

    it('should handle not allowed', async () => {
      prismaService.customDomain.findUnique.mockResolvedValueOnce(customDomain)
      await expect(
        resolver.customDomainCheck('customDomainId', ability)
      ).rejects.toThrow('user is not allowed to check custom domain')
    })
  })

  describe('journeyCollection', () => {
    it('should return a journey collection', async () => {
      prismaService.journeyCollection.findFirst.mockResolvedValueOnce({
        id: 'id',
        team: {
          id: 'teamId'
        } as unknown as Team,
        title: 'title',
        journeyCollectionJourneys: [
          {
            id: 'id',
            order: 1,
            journey: {
              id: 'id'
            } as unknown as Journey
          }
        ]
      } as unknown as JourneyCollection)
      expect(
        await resolver.journeyCollection({
          ...customDomain,
          journeyCollectionId: 'id'
        })
      ).toEqual({
        id: 'id',
        team: {
          id: 'teamId'
        },
        title: 'title',
        journeys: [
          {
            id: 'id'
          }
        ]
      })
    })

    it('should handle null', async () => {
      expect(
        await resolver.journeyCollection({
          ...customDomain,
          journeyCollectionId: null
        })
      ).toBeNull()
    })
  })

  describe('team', () => {
    it('should return a team', async () => {
      const team: Team = {
        id: 'id',
        title: 'title',
        publicTitle: 'publicTitle',
        createdAt: new Date(),
        updatedAt: new Date(),
        plausibleToken: null
      }
      prismaService.team.findUnique.mockResolvedValue(team)
      expect(await resolver.team(customDomain)).toEqual(team)
    })
  })
})
