import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { HostResolver } from './host.resolver'

describe('HostResolver', () => {
  let hostResolver: HostResolver,
    prismaService: PrismaService,
    journeyService: JourneyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostResolver,
        PrismaService,
        JourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    hostResolver = module.get<HostResolver>(HostResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    journeyService = module.get<JourneyService>(JourneyService)
  })

  describe('hostCreate', () => {
    it('should create a new host', async () => {
      const teamId = 'team-id'
      const input = {
        title: 'New Host',
        location: 'Location',
        src1: 'avatar1',
        src2: 'avatar2'
      }
      const mockHost = { teamId, ...input, id: 'hostid' }
      jest.spyOn(prismaService.host, 'create').mockResolvedValue(mockHost)

      const result = await hostResolver.hostCreate(teamId, input)

      expect(result).toEqual(mockHost)
      expect(prismaService.host.create).toHaveBeenCalledWith({
        data: { teamId, ...input }
      })
    })
  })

  describe('hostResolver', () => {
    it('should return an array of hosts', async () => {
      const userId = 'user-1'
      const teamId = 'edmondshen'
      const mockHosts = [
        {
          id: 'host-id',
          teamId: 'edmond-shen-fans',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2'
        },
        {
          id: 'host-id2',
          teamId: 'best-juniors-engineers-gang',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          src1: 'avatar1',
          src2: 'avatar2'
        }
      ]
      jest.spyOn(prismaService.host, 'findMany').mockResolvedValue(mockHosts)

      const result = await hostResolver.hosts(userId, teamId)

      expect(result).toEqual(mockHosts)
      expect(prismaService.host.findMany).toHaveBeenCalledWith({
        where: { teamId, team: { userTeams: { some: { userId } } } }
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
      jest
        .spyOn(prismaService.host, 'update')
        .mockResolvedValue(mockUpdatedHost)

      const result = await hostResolver.hostUpdate(id, input)

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
      const mockUpdatedHost = { ...mockHost, ...input }
      jest
        .spyOn(prismaService.host, 'update')
        .mockResolvedValue(mockUpdatedHost)

      const result = await hostResolver.hostUpdate(id, input)

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

      await expect(hostResolver.hostUpdate(hostId, input)).rejects.toThrow(
        'host title cannot be set to null'
      )
    })
  })

  describe('hostDelete', () => {
    it('should delete an existing host', async () => {
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
      jest
        .spyOn(prismaService.host, 'delete')
        .mockResolvedValue(mockDeletedHost)

      journeyService.getAllByHost = jest.fn().mockReturnValueOnce([journey])

      const result = await hostResolver.hostDelete(id)

      expect(result).toEqual(mockDeletedHost)
      expect(prismaService.host.delete).toHaveBeenCalledWith({ where: { id } })
    })

    it('should throw an error if the host exists on other journeys', async () => {
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

      journeyService.getAllByHost = jest
        .fn()
        .mockReturnValueOnce([journey, journeyTwo])
      jest
        .spyOn(prismaService.host, 'delete')
        .mockResolvedValue(mockDeletedHost)

      await expect(hostResolver.hostDelete(id)).rejects.toThrow(
        'this host is used in other journeys'
      )
    })
  })
})
