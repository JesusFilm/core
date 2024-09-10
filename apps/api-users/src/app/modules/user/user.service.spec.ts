import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { UserRecord, getAuth } from 'firebase-admin/auth'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'

import { User } from '.prisma/api-users-client'
import { auth } from '@core/nest/common/firebaseClient'

import { PrismaService } from '../../lib/prisma.service'

import { UserService, generateSixDigitNumber } from './user.service'

const authUser = {
  displayName: 'fo sho',
  email: 'tho@no.co',
  photoURL: 'p',
  emailVerified: true,
  updateUser: jest.fn().mockResolvedValue({} as unknown as UserRecord)
}

const user = {
  id: 'userId',
  firstName: 'fo',
  lastName: 'sho',
  email: 'tho@no.co',
  imageUrl: 'po',
  emailVerified: true
} as unknown as User

describe('UserService', () => {
  let userService: UserService, prismaService: DeepMockProxy<PrismaService>
  let emailQueue

  const removeJob = jest.fn()

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn(),
      getJob: jest.fn(() => ({
        remove: removeJob
      }))
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        { provide: getQueueToken('api-users-email'), useValue: emailQueue }
      ]
    })
      .overrideProvider(getQueueToken('api-users-email'))
      .useValue(emailQueue)
      .compile()

    userService = module.get<UserService>(UserService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    removeJob.mockClear()
    jest.clearAllMocks()
  })

  describe('verifyUser', () => {
    it('should send an email with the correct subject and body', async () => {
      const email = 'tav@example.com'
      const userId = 'userId'
      await userService.verifyUser(userId, email)
      expect(emailQueue.add).toHaveBeenCalledWith(
        'verifyUser',
        {
          email,
          token: expect.any(String),
          userId: 'userId'
        },
        {
          jobId: expect.any(String),
          removeOnComplete: {
            age: 24 * 3600 // keep up to 24 hours
          },
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })

    it('should create new job if none exists', async () => {
      const email = 'tav@example.com'
      const userId = 'userId'
      emailQueue.getJob.mockResolvedValue(null)
      await userService.verifyUser(userId, email)
      expect(removeJob).not.toHaveBeenCalled()
      expect(emailQueue.add).toHaveBeenCalledWith(
        'verifyUser',
        {
          email,
          token: expect.any(String),
          userId: 'userId'
        },
        {
          jobId: expect.any(String),
          removeOnComplete: {
            age: 24 * 3600 // keep up to 24 hours
          },
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })

    it('should use example token', async () => {
      process.env.EXAMPLE_EMAIL_TOKEN = '123456'
      const email = 'tav@example.com'
      const userId = 'userId'
      emailQueue.getJob.mockResolvedValue(null)
      await userService.verifyUser(userId, email)
      expect(removeJob).not.toHaveBeenCalled()
      expect(emailQueue.add).toHaveBeenCalledWith(
        'verifyUser',
        {
          email,
          token: '123456',
          userId: 'userId'
        },
        {
          jobId: expect.any(String),
          removeOnComplete: {
            age: 24 * 3600 // keep up to 24 hours
          },
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })

  describe('validateEmail', () => {
    it('should validate email if token is correct', async () => {
      const token = 'token'
      const user = { userId: 'userId' } as unknown as User
      const updateUserSpy = jest
        .spyOn(getAuth(), 'updateUser')
        .mockResolvedValue({} as unknown as UserRecord)
      emailQueue.getJob.mockResolvedValue({ data: { token: 'token' } })

      const validateEmailRes = await userService.validateEmail(
        user.userId,
        token
      )

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { userId: user.userId },
        data: { emailVerified: true }
      })
      expect(updateUserSpy).toHaveBeenCalledWith(user.userId, {
        emailVerified: true
      })
      expect(validateEmailRes).toBe(true)
    })

    it('should not validate email if token is wrong', async () => {
      const token = 'token'
      const user = { userId: 'userId' } as unknown as User
      emailQueue.getJob.mockResolvedValue({ data: { token: 'newtoken' } })
      const validateEmailRes = await userService.validateEmail(
        user.userId,
        token
      )

      expect(validateEmailRes).toBe(false)
    })
  })

  describe('findOrFetchUser', () => {
    jest
      .spyOn(auth, 'getUser')
      .mockResolvedValue(authUser as unknown as UserRecord)

    it('returns User', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(user)
      expect(await userService.findOrFetchUser('userId')).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: user.id }
      })
    })

    it('updates User', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null)
      prismaService.user.create.mockRejectedValueOnce(
        new Error('user already exists')
      )
      await userService.findOrFetchUser('userId')
      expect(prismaService.user.update).toHaveBeenCalled()
    })

    it('returns email verified status always', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        omit(user, ['emailVerified']) as User
      )
      prismaService.user.update.mockResolvedValue(user)
      expect(await userService.findOrFetchUser('userId')).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: user.id }
      })
    })

    it('fetches user from firebase', async () => {
      const verifyUserSpy = jest.spyOn(UserService.prototype, 'verifyUser')
      jest.spyOn(auth, 'getUser').mockResolvedValue({
        ...authUser,
        emailVerified: false
      } as unknown as UserRecord)
      prismaService.user.findUnique.mockResolvedValueOnce(null)
      prismaService.user.create.mockResolvedValueOnce({
        ...user,
        emailVerified: false
      })
      expect(await userService.findOrFetchUser('userId')).toEqual({
        ...user,
        emailVerified: false
      })
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'tho@no.co',
          firstName: 'fo',
          imageUrl: 'p',
          lastName: 'sho',
          userId: 'userId',
          emailVerified: false
        }
      })
      expect(verifyUserSpy).toHaveBeenCalledWith(
        'userId',
        'tho@no.co',
        undefined
      )
    })
  })

  describe('generateSixDigitNumber', () => {
    it('should return a string of length 6', () => {
      const sixDigitNumber = generateSixDigitNumber()
      expect(sixDigitNumber).toHaveLength(6)
    })
  })
})
