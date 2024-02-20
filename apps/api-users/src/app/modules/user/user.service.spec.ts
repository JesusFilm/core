import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { UserRecord, getAuth } from 'firebase-admin/auth'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'

import { UserService } from './user.service'

describe('UserService', () => {
  let userService: UserService, prismaService: PrismaService
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
  })

  describe('validateEmail', () => {
    it('should validate email if token is correct', async () => {
      const token = 'token'
      const user = { userId: 'userId' } as unknown as User
      const updateUserSpy = jest
        .spyOn(getAuth(), 'updateUser')
        .mockResolvedValue({} as unknown as UserRecord)
      emailQueue.getJob.mockResolvedValue({ data: { token: 'token' } })

      const validateEmailRes = await userService.validateEmail(user, token)

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
      const validateEmailRes = await userService.validateEmail(user, token)

      expect(validateEmailRes).toBe(false)
    })
  })
})
