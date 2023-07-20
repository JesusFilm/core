import { Test, TestingModule } from '@nestjs/testing'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { UserTeamRole } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { HostResolver } from './host.resolver'

describe('HostResolver', () => {
  let hostResolver: HostResolver, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [HostResolver, PrismaService]
    }).compile()

    hostResolver = module.get<HostResolver>(HostResolver)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe('hostCreate', () => {
    it('should create a new host', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.member
          }
        ]
      }
      const input = {
        title: 'New Host',
        location: 'Location',
        src1: 'avatar1',
        src2: 'avatar2'
      }
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })

      const mockHost = { teamId: team.id, ...input, id: 'hostid' }
      prismaService.team.findUnique = jest.fn().mockResolvedValue(team)
      prismaService.host.create = jest.fn().mockResolvedValue(mockHost)

      const result = await hostResolver.hostCreate(ability, team.id, input)

      expect(result).toEqual(mockHost)
      expect(prismaService.host.create).toHaveBeenCalledWith({
        data: { teamId: team.id, ...input }
      })
    })
  })

  describe('hostResolver', () => {
    it('should return an array of hosts', async () => {
      const teamId = 'edmondshen'
      const mockHosts = [
        {
          id: 'host-id',
          teamId: 'edmond-shen-fans',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2',
          updatedAt: new Date()
        },
        {
          id: 'host-id2',
          teamId: 'best-juniors-engineers-gang',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2',
          updatedAt: new Date()
        }
      ]
      jest.spyOn(prismaService.host, 'findMany').mockResolvedValue(mockHosts)

      const result = await hostResolver.hosts({ teamId }, teamId)

      expect(result).toEqual(mockHosts)
      expect(prismaService.host.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ teamId: 'edmondshen' }, { teamId: 'edmondshen' }]
        }
      })
    })
  })

  describe('hostUpdate', () => {
    it('should update an existing host', async () => {
      const id = 'host-id'
      const input = {
        title: 'Edmond Shen',
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }

      const mockHost = {
        id: 'host-id',
        teamId: 'best-juniors-engineers-gang',
        title: 'Edmond Shen & Nisal Cottingham',
        location: 'JFP Staff',
        src1: 'avatar1',
        src2: 'avatar2'
      }

      const mockUpdatedHost = { ...mockHost, ...input }
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const hostFindUnique = {
        mockHost,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.host.update = jest.fn().mockResolvedValue(mockUpdatedHost)
      prismaService.host.findUnique = jest
        .fn()
        .mockResolvedValue(hostFindUnique)
      const result = await hostResolver.hostUpdate(ability, id, input)

      expect(result).toEqual(mockUpdatedHost)

      expect(prismaService.host.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          title: input.title,
          location: input.location,
          src1: input.src1,
          src2: input.src2
        }
      })
    })

    it('should update an existing host if input title is undefined', async () => {
      const id = 'host-id'
      const input = {
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }
      const mockHost = {
        id: 'host-id',
        teamId: 'best-juniors-engineers-gang',
        title: 'Edmond Shen & Nisal Cottingham',
        location: 'JFP Staff',
        src1: 'avatar1',
        src2: 'avatar2'
      }
      const hostFindUnique = {
        mockHost,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const mockUpdatedHost = { ...mockHost, ...input }
      prismaService.host.update = jest.fn().mockResolvedValue(mockUpdatedHost)
      prismaService.host.findUnique = jest
        .fn()
        .mockResolvedValue(hostFindUnique)
      const result = await hostResolver.hostUpdate(ability, id, input)

      expect(result).toEqual(mockUpdatedHost)

      expect(prismaService.host.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          title: undefined,
          location: input.location,
          src1: input.src1,
          src2: input.src2
        }
      })
    })

    it('should throw UserInputError when host title is null', async () => {
      const hostId = 'host-id'
      const input = {
        title: null,
        location: 'National Team Staff',
        src1: 'new-profile-pic-who-this',
        src2: 'avatar2'
      }
      const hostFindUnique = {
        hostId,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.host.findUnique = jest
        .fn()
        .mockResolvedValue(hostFindUnique)

      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        hostResolver.hostUpdate(ability, hostId, input)
      ).rejects.toThrow('host title cannot be set to null')
    })
  })

  describe('hostDelete', () => {
    it('should delete an existing host', async () => {
      const id = 'host-id'
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const mockDeletedHost = {
        id: 'host-id',
        teamId: 'best-juniors-engineers-gang',
        title: 'Edmond Shen & Nisal Cottingham',
        location: 'JFP Staff',
        src1: 'avatar1',
        src2: 'avatar2'
      }
      const journey: Journey = {
        id: 'journeyId',
        slug: 'journey-slug',
        title: 'published',
        status: JourneyStatus.published,
        language: { id: '529' },
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        description: null,
        primaryImageBlock: null,
        publishedAt: null,
        createdAt: null as unknown as string,
        host: mockDeletedHost,
        chatButtons: []
      }

      const hostFindUnique = {
        mockDeletedHost,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.host.findUnique = jest
        .fn()
        .mockResolvedValue(hostFindUnique)
      prismaService.host.delete = jest.fn().mockResolvedValue(mockDeletedHost)

      prismaService.journey.findMany = jest.fn().mockReturnValueOnce([journey])

      const result = await hostResolver.hostDelete(ability, id)

      expect(result).toEqual(mockDeletedHost)
      expect(prismaService.host.delete).toHaveBeenCalledWith({ where: { id } })
    })

    it('should throw an error if the host exists on other journeys', async () => {
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const id = 'host-id'
      const mockDeletedHost = {
        id: 'host-id',
        teamId: 'best-juniors-engineers-gang',
        title: 'Edmond Shen & Nisal Cottingham',
        location: 'JFP Staff',
        src1: 'avatar1',
        src2: 'avatar2'
      }
      const journey: Journey = {
        id: 'journeyId',
        slug: 'journey-slug',
        title: 'published',
        status: JourneyStatus.published,
        language: { id: '529' },
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        description: null,
        primaryImageBlock: null,
        publishedAt: null,
        createdAt: null as unknown as string,
        host: mockDeletedHost,
        chatButtons: []
      }

      const journeyTwo: Journey = {
        id: 'journeyId2',
        slug: 'journey-slug2',
        title: 'published',
        status: JourneyStatus.published,
        language: { id: '529' },
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        description: null,
        primaryImageBlock: null,
        publishedAt: null,
        createdAt: null as unknown as string,
        host: mockDeletedHost,
        chatButtons: []
      }

      const hostFindUnique = {
        mockDeletedHost,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.host.findUnique = jest
        .fn()
        .mockResolvedValue(hostFindUnique)

      prismaService.journey.findMany = jest
        .fn()
        .mockReturnValueOnce([journey, journeyTwo])
      prismaService.host.delete = jest.fn().mockResolvedValue(mockDeletedHost)

      await expect(hostResolver.hostDelete(ability, id)).rejects.toThrow(
        'This host is used in other journeys.'
      )
    })
  })
})
