import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Role } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'

import { UserRoleService } from './userRole.service'

describe('userRoleService', () => {
  let service: UserRoleService, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<UserRoleService>(UserRoleService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
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
      prismaService.userRole.upsert.mockResolvedValue(user)
      expect(await service.getUserRoleById('1')).toEqual(user)
      expect(prismaService.userRole.upsert).toHaveBeenCalledWith({
        where: { userId: '1' },
        update: {},
        create: { userId: '1' }
      })
    })

    it('should retry if error', async () => {
      prismaService.userRole.upsert.mockRejectedValueOnce({
        code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
      })
      prismaService.userRole.upsert.mockResolvedValue(user)
      expect(await service.getUserRoleById('1')).toEqual(user)
      expect(prismaService.userRole.upsert).toHaveBeenCalledWith({
        where: { userId: '1' },
        update: {},
        create: { userId: '1' }
      })
    })
  })
})
