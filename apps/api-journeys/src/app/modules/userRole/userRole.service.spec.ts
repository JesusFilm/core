import { Test, TestingModule } from '@nestjs/testing'

import { Role } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { UserRoleService } from './userRole.service'

describe('userRoleService', () => {
  let service: UserRoleService, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleService, PrismaService]
    }).compile()

    service = module.get<UserRoleService>(UserRoleService)
    prismaService = module.get<PrismaService>(PrismaService)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const user = {
    id: '1',
    userId: 'userId',
    roles: [Role.publisher]
  }

  describe('getUserRoleById', () => {
    it('should return a user role if exists', async () => {
      prismaService.userRole.findUnique = jest.fn().mockResolvedValue(user)
      expect(await service.getUserRoleById('1')).toEqual(user)
    })

    it('should return a newly created user role', async () => {
      const user2 = {
        id: '2',
        userId: 'userId2',
        roles: []
      }
      prismaService.userRole.findUnique = jest.fn().mockResolvedValue(null)
      prismaService.userRole.create = jest.fn().mockResolvedValue(user2)
      expect(await service.getUserRoleById('2')).toEqual(user2)
    })
  })
})
