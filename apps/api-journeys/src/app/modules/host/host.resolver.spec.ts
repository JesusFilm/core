import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../lib/prisma.service'
import { HostResolver } from './host.resolver'

describe('HostResolver', () => {
  let hostResolver: HostResolver, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostResolver,
        {
          provide: PrismaService,
          useValue: {
            host: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ]
    }).compile()

    hostResolver = module.get<HostResolver>(HostResolver)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe('hostCreate', () => {
    it('should create a new host', async () => {
      const teamId = 'team-id'
      const input = {
        title: 'New Host',
        location: 'Location',
        avatar1Id: 'avatar1',
        avatar2Id: 'avatar2'
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
          avatar1Id: 'avatar1-id',
          avatar2Id: 'vatar2-id'
        },
        {
          id: 'host-id2',
          teamId: 'best-juniors-engineers-gang',
          title: 'Edmond Shen & Nisal Cottingham',
          location: 'New Zealand',
          avatar1Id: 'avatar1-id',
          avatar2Id: 'avatar2-id'
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
        avatar1Id: 'new-profile-pic-who-thos',
        avatar2Id: 'new-avatar2'
      }
      const mockHost = {
        id: 'host-id',
        teamId: 'best-juniors-engineers-gang',
        title: 'Edmond Shen & Nisal Cottingham',
        location: 'JFP Staff',
        avatar1Id: 'avatar1-id',
        avatar2Id: 'avatar2-id'
      }
      const mockUpdatedHost = { ...mockHost, ...input }
      jest.spyOn(prismaService.host, 'findUnique').mockResolvedValue(mockHost)
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
          avatar1Id: input.avatar1Id,
          avatar2Id: input.avatar2Id
        }
      })
    })

    it('should throw UserInputError when host title is undefined', async () => {
      const hostId = 'host-id'
      const input = {
        title: undefined as unknown as string,
        location: 'National Team Staff',
        avatar1Id: 'new-profile-pic-who-thos',
        avatar2Id: 'new-avatar2'
      }
      await hostResolver
        .hostUpdate(hostId, input)
        .catch((e) =>
          expect(e.message).toEqual('host title cannot be undefined or null')
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
        avatar1Id: 'avatar1-id',
        avatar2Id: 'avatar2-id'
      }
      jest
        .spyOn(prismaService.host, 'delete')
        .mockResolvedValue(mockDeletedHost)

      const result = await hostResolver.hostDelete(id)

      expect(result).toEqual(mockDeletedHost)
      expect(prismaService.host.delete).toHaveBeenCalledWith({ where: { id } })
    })
  })
})
