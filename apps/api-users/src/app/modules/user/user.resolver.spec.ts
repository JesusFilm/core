import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'

import { UserResolver, isValidInterOp, validateIpV4 } from './user.resolver'
import { UserService } from './user.service'

jest.mock('@core/nest/common/firebaseClient', () => ({
  impersonateUser: jest.fn().mockResolvedValue('impersonationToken')
}))

describe('UserResolver', () => {
  let resolver: UserResolver,
    prismaService: DeepMockProxy<PrismaService>,
    userService: DeepMockProxy<UserService>

  const user = {
    id: 'userId',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po',
    emailVerified: true
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: UserService,
          useValue: mockDeep<UserService>()
        }
      ]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    userService = module.get<UserService>(
      UserService
    ) as DeepMockProxy<UserService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('me', () => {
    it('return findOrFetchUser', async () => {
      userService.findOrFetchUser.mockResolvedValueOnce(user)
      expect(await resolver.me('userId', { redirect: '/templates' })).toEqual(
        user
      )
      expect(userService.findOrFetchUser).toHaveBeenCalledWith(
        'userId',
        '/templates'
      )
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
    it('return findOrFetchUser', async () => {
      userService.findOrFetchUser.mockResolvedValueOnce(user)
      expect(
        await resolver.resolveReference({ __typename: 'User', id: 'userId' })
      ).toEqual(user)
      expect(userService.findOrFetchUser).toHaveBeenCalledWith('userId')
    })

    // can't get google mock to work right
    it.skip('sends an email', async () => {
      jest
        .spyOn(userService, 'verifyUser')
        .mockImplementation(async () => await Promise.resolve())
      jest.mock('@core/nest/common/firebaseClient', () => ({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            displayName: 'fo sho',
            email: 'tho@no.co',
            photoURL: 'p',
            emailVerified: false
          })
        },
        impersonateUser: jest.fn().mockResolvedValue('impersonationToken')
      }))
      prismaService.user.findUnique.mockResolvedValueOnce({
        ...user,
        emailVerified: false
      })
      await resolver.resolveReference({ __typename: 'User', id: 'userId' })
      expect(userService.verifyUser).toHaveBeenCalledWith(user.id, user.email)
    })
  })

  describe('validateIpV4', () => {
    it('is localhost', () => {
      expect(validateIpV4(null)).toBe(true)
    })

    it('is stage aws', () => {
      expect(validateIpV4('3.13.104.200')).toBe(true)
    })

    it('is prod aws', () => {
      expect(validateIpV4('18.225.26.131')).toBe(true)
    })

    it('is localhost ip', () => {
      expect(validateIpV4('127.0.0.1')).toBe(true)
    })

    it('is proxied external ip', () => {
      expect(validateIpV4('1.2.3.4, 10.1.1.1')).toBe(false)
    })
  })

  describe('isValidInterOp', () => {
    it('should be false', () => {
      process.env.INTEROP_TOKEN = '123'
      expect(isValidInterOp('1234', '10.1.2.3')).toBe(false)
    })

    it('should be true', () => {
      process.env.INTEROP_TOKEN = '1234'
      expect(isValidInterOp('1234', '18.225.26.131')).toBe(true)
    })
  })

  describe('createVerificationRequest', () => {
    it('should create a verification request', async () => {
      userService.verifyUser.mockImplementation(
        async () => await Promise.resolve()
      )
      expect(
        await resolver.createVerificationRequest(user, {
          redirect: '/templates'
        })
      ).toBe(true)
      expect(userService.verifyUser).toHaveBeenCalledWith(
        user.id,
        user.email,
        '/templates'
      )
    })
  })
})
