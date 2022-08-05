import { Test, TestingModule } from '@nestjs/testing'
import { Role } from '../../__generated__/graphql'

import { UserRoleResolver } from './userRole.resolver'
import { UserRoleService } from './userRole.service'

describe('UserRoleResolver', () => {
  let resolver: UserRoleResolver, service: UserRoleService

  it('should save the user', async () => {
    const user = {
      userId: 'userId'
    }

    const userRoleService = {
      provide: UserRoleService,
      useFactory: () => ({
        getUserRoleById: jest.fn(() => undefined),
        save: jest.fn((input) => input)
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleResolver, userRoleService]
    }).compile()
    resolver = module.get<UserRoleResolver>(UserRoleResolver)
    service = await module.resolve(UserRoleService)

    await resolver.getUserRole(user.userId)
    expect(service.save).toHaveBeenCalledWith(user)
  })

  it('should return user', async () => {
    const user = {
      id: '1',
      userId: 'userId'
    }

    const userRoleService = {
      provide: UserRoleService,
      useFactory: () => ({
        getUserRoleById: jest.fn(() => user)
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleResolver, userRoleService]
    }).compile()
    resolver = module.get<UserRoleResolver>(UserRoleResolver)

    expect(await resolver.getUserRole('userId')).toEqual(user)
  })

  it('should return user with roles', async () => {
    const user = {
      id: '1',
      userId: 'userId',
      roles: [Role.publisher]
    }

    const userRoleService = {
      provide: UserRoleService,
      useFactory: () => ({
        getUserRoleById: jest.fn(() => user)
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleResolver, userRoleService]
    }).compile()
    resolver = module.get<UserRoleResolver>(UserRoleResolver)

    expect(await resolver.getUserRole('userId')).toEqual(user)
  })
})
