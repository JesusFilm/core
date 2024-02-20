import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'

import { UserService } from './user.service'

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({ updateUser: jest.fn }))
}))

describe('UserService', () => {
  let userService: UserService, prismaService: DeepMockProxy<PrismaService>

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
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
      // .overrideProvider(getQueueToken('api-users-email'))
      // .useValue(emailQueue)
      .compile()

    userService = module.get<UserService>(UserService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => jest.clearAllMocks())

  describe('verifyUser', () => {
    it('should send an email with the correct subject and body', async () => {
      const email = 'tav@example.com'
      const userId = 'userId'
      prismaService.userToken.upsert.mockResolvedValue({
        id: 'userTokenId',
        userId: 'userId',
        token: 'token'
      })
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
  })

  describe('validateEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const token = 'token'
      const user = { userId: 'userId' } as unknown as User
      const expectedUserToken = {
        id: 'userTokenId',
        userId: user.userId,
        token
      }
      prismaService.userToken.findFirst.mockResolvedValue(expectedUserToken)
      const validateEmailRes = await userService.validateEmail(user, token)

      expect(validateEmailRes).toBe(true)
    })
  })
})
