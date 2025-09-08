import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Host, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { HostResolver } from './host.resolver'

describe('HostResolver', () => {
  let hostResolver: HostResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        HostResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    hostResolver = module.get<HostResolver>(HostResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('hosts', () => {
    it('returns an array of hosts', async () => {
      const hosts: Host[] = [
        {
          id: 'hostId',
          teamId: 'teamId',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2',
          updatedAt: new Date()
        },
        {
          id: 'hostId2',
          teamId: 'teamId',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2',
          updatedAt: new Date()
        }
      ]
      jest.spyOn(prismaService.host, 'findMany').mockResolvedValue(hosts)
      expect(await hostResolver.hosts({ OR: [{}] }, 'teamId')).toEqual(hosts)
      expect(prismaService.host.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [{}] }, { teamId: 'teamId' }]
        }
      })
    })
  })

  describe('hostCreate', () => {
    const input = {
      title: 'New Host',
      location: 'Location',
      src1: 'avatar1',
      src2: 'avatar2'
    }
    const host: Host = {
      teamId: 'teamId',
      ...input,
      id: 'hostid',
      updatedAt: new Date()
    }
    const hostWithUserTeam = {
      ...host,
      team: { userTeams: [{ userId: 'userId', role: UserTeamRole.member }] }
    }

    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a new host', async () => {
      prismaService.host.create.mockResolvedValue(host)
      prismaService.host.findUnique.mockResolvedValue(hostWithUserTeam)
      expect(await hostResolver.hostCreate(ability, 'teamId', input)).toEqual(
        hostWithUserTeam
      )
      expect(prismaService.host.create).toHaveBeenCalledWith({
        data: { team: { connect: { id: 'teamId' } }, ...input }
      })
    })

    it('throws error if not found', async () => {
      prismaService.host.create.mockResolvedValue(host)
      prismaService.host.findUnique.mockResolvedValueOnce(null)
      await expect(
        hostResolver.hostCreate(ability, 'hostId', input)
      ).rejects.toThrow('host not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.host.create.mockResolvedValue(host)
      prismaService.host.findUnique.mockResolvedValueOnce(host)
      await expect(
        hostResolver.hostCreate(ability, 'hostId', input)
      ).rejects.toThrow('user is not allowed to create host')
    })
  })

  describe('hostUpdate', () => {
    const host: Host = {
      id: 'hostId',
      teamId: 'best-juniors-engineers-gang',
      title: 'Edmond Shen & Nisal Cottingham',
      location: 'JFP Staff',
      src1: 'avatar1',
      src2: 'avatar2',
      updatedAt: new Date()
    }
    const hostWithUserTeam = {
      ...host,
      team: { userTeams: [{ userId: 'userId', role: UserTeamRole.member }] }
    }

    it('updates an existing host', async () => {
      const input = {
        title: 'Edmond Shen',
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }
      const hostUpdated = { ...host, ...input }
      prismaService.host.findUnique.mockResolvedValue(hostWithUserTeam)
      prismaService.host.update.mockResolvedValue(hostUpdated)
      const result = await hostResolver.hostUpdate(ability, 'hostId', input)
      expect(result).toEqual(hostUpdated)
      expect(prismaService.host.update).toHaveBeenCalledWith({
        where: { id: 'hostId' },
        data: input
      })
    })

    it('updates an existing host if input title is undefined', async () => {
      const input = {
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }
      const hostUpdated = { ...host, ...input }
      prismaService.host.findUnique.mockResolvedValue(hostWithUserTeam)
      prismaService.host.update.mockResolvedValue(hostUpdated)
      expect(await hostResolver.hostUpdate(ability, 'hostId', input)).toEqual(
        hostUpdated
      )
      expect(prismaService.host.update).toHaveBeenCalledWith({
        where: { id: 'hostId' },
        data: {
          title: undefined,
          location: input.location,
          src1: input.src1,
          src2: input.src2
        }
      })
    })

    it('throw error when host title is null', async () => {
      const input = {
        title: null,
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }
      prismaService.host.findUnique.mockResolvedValue(hostWithUserTeam)
      await expect(
        hostResolver.hostUpdate(ability, 'hostId', input)
      ).rejects.toThrow('host title cannot be set to null')
    })

    it('throws error if not found', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(null)
      await expect(
        hostResolver.hostUpdate(ability, 'hostId', {})
      ).rejects.toThrow('host not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(host)
      await expect(
        hostResolver.hostUpdate(ability, 'hostId', {})
      ).rejects.toThrow('user is not allowed to update host')
    })
  })

  describe('hostDelete', () => {
    const host: Host = {
      id: 'hostId',
      teamId: 'best-juniors-engineers-gang',
      title: 'Edmond Shen & Nisal Cottingham',
      location: 'JFP Staff',
      src1: 'avatar1',
      src2: 'avatar2',
      updatedAt: new Date()
    }
    const hostWithUserTeam = {
      ...host,
      team: { userTeams: [{ userId: 'userId', role: UserTeamRole.member }] }
    }
    const journey: Journey = {
      id: 'journeyId',
      slug: 'journey-slug',
      title: 'published',
      status: JourneyStatus.published,
      languageId: '529',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      description: null,
      primaryImageBlockId: null,
      publishedAt: null,
      createdAt: new Date(),
      hostId: 'hostId',
      archivedAt: null,
      deletedAt: null,
      trashedAt: null,
      featuredAt: null,
      seoTitle: 'seoTitle',
      seoDescription: 'seoDescription',
      template: false,
      teamId: 'teamId',
      updatedAt: new Date(),
      strategySlug: null,
      creatorDescription: null,
      creatorImageBlockId: null,
      plausibleToken: null,
      website: null,
      showShareButton: null,
      showLikeButton: null,
      showDislikeButton: null,
      displayTitle: null,
      showHosts: null,
      showChatButtons: null,
      showReactionButtons: null,
      showLogo: null,
      showMenu: null,
      showDisplayTitle: null,
      menuButtonIcon: null,
      logoImageBlockId: null,
      menuStepBlockId: null,
      socialNodeX: null,
      socialNodeY: null,
      fromTemplateId: null,
      journeyCustomizationDescription: null,
      guestJourney: null
    }

    it('deletes an existing host', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(hostWithUserTeam)
      prismaService.host.delete.mockResolvedValueOnce(host)
      prismaService.journey.findMany.mockResolvedValueOnce([journey])
      expect(await hostResolver.hostDelete(ability, 'hostId')).toEqual(host)
      expect(prismaService.host.delete).toHaveBeenCalledWith({
        where: { id: 'hostId' }
      })
    })

    it('throws error if the host exists on other journeys', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(hostWithUserTeam)
      prismaService.journey.findMany.mockResolvedValueOnce([journey, journey])
      await expect(hostResolver.hostDelete(ability, 'hostId')).rejects.toThrow(
        'This host is used in other journeys.'
      )
    })

    it('throws error if not found', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(null)
      await expect(hostResolver.hostDelete(ability, 'hostId')).rejects.toThrow(
        'host not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.host.findUnique.mockResolvedValueOnce(host)
      await expect(hostResolver.hostDelete(ability, 'hostId')).rejects.toThrow(
        'user is not allowed to delete host'
      )
    })
  })
})
