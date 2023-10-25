import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'

import { UserResolver } from './user.resolver'

jest.mock('@core/nest/common/firebaseClient', () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      displayName: 'fo sho',
      email: 'tho@no.co',
      photoURL: 'p'
    })
  },
  impersonateUser: jest.fn().mockResolvedValue('impersonationToken')
}))

describe('UserResolver', () => {
  let resolver: UserResolver, prismaService: DeepMockProxy<PrismaService>

  const user = {
    id: 'userId',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('me', () => {
    it('returns User', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(user)
      expect(await resolver.me('userId')).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: user.id }
      })
    })

    it('fetches user from firebase', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null)
      prismaService.user.upsert.mockResolvedValueOnce(user)
      expect(await resolver.me('userId')).toEqual(user)
      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        create: {
          email: 'tho@no.co',
          firstName: 'fo',
          imageUrl: 'p',
          lastName: 'sho',
          userId: 'userId'
        },
        update: {
          email: 'tho@no.co',
          firstName: 'fo',
          imageUrl: 'p',
          lastName: 'sho',
          userId: 'userId'
        },
        where: { userId: 'userId' }
      })
    })
  })

  describe('userImpersonate', () => {
    const userToImpersonate = {
      id: 'imposterId',
      userId: 'imposterUserId',
      firstName: 'imposter',
      lastName: 'alpha',
      email: 'imposters@inc.com'
    } as unknown as User

    it('returns a user token', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({
        ...user,
        superAdmin: true
      })
      prismaService.user.findUnique.mockResolvedValueOnce(userToImpersonate)
      expect(
        await resolver.userImpersonate('userId', 'imposters@inc.com')
      ).toBe('impersonationToken')
    })

    it('throws an error when user is not a superAdmin', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(user)
      await expect(
        resolver.userImpersonate('userId', 'imposters@inc.com')
      ).rejects.toThrow('user is not allowed to impersonate another user')
    })

    it('throws an error when email does not match any user', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({
        ...user,
        superAdmin: true
      })
      prismaService.user.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userImpersonate('userId', 'imposters@inc.com')
      ).rejects.toThrow('email does not match any user')
    })
  })

  describe('resolveReference', () => {
    it('returns User', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(user)
      expect(
        await resolver.resolveReference({ __typename: 'User', id: 'userId' })
      ).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'userId' }
      })
    })
  })
})
