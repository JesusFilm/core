import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { UserRecord, getAuth } from 'firebase-admin/auth'

import { User } from '@core/nest/common/firebaseClient'

import { PrismaService } from '../../lib/prisma.service'
import { VerifyUserJob } from '../email/email.consumer'

import { UserModule } from './user.module'
import { UserService } from './user.service'

const user = {
  id: 'userId',
  firstName: 'fo',
  lastName: 'sho',
  email: 'test@example.com',
  emailVerified: true
}

describe('UserService', () => {
  let userService: UserService
  const emailQueue = {
    add: jest.fn(),
    getJob: jest.fn()
  }
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule]
    })
      .overrideProvider(getQueueToken('api-users-email'))
      .useValue(emailQueue)
      .compile()

    userService = module.get<UserService>(UserService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe('verifyUser', () => {
    it('should add a job to the email queue', async () => {
      const addSpy = jest.spyOn(emailQueue, 'add')

      const userId = '123'
      const email = 'test@example.com'

      await userService.verifyUser(userId, email)

      expect(addSpy).toHaveBeenCalledWith(
        'verifyUser',
        {
          userId,
          email,
          token: expect.any(String)
        },
        {
          jobId: expect.stringContaining(`${userId}-`),
          removeOnComplete: {
            age: 24 * 3600
          },
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })

  describe('validateEmail', () => {
    it('should update user emailVerified status and return true if job exists', async () => {
      const getJobSpy = jest
        .spyOn(emailQueue, 'getJob')
        .mockResolvedValue({} as unknown as Job<VerifyUserJob>)

      prismaService.user.update = jest
        .fn()
        .mockResolvedValue({ user } as unknown as User)

      const updateUserSpy = jest
        .spyOn(getAuth(), 'updateUser')
        .mockResolvedValue({} as unknown as UserRecord)

      const userId = '123'
      const token = 'abc'

      const result = await userService.validateEmail(userId, token)

      expect(getJobSpy).toHaveBeenCalledWith(`${userId}-${token}`)
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: { emailVerified: true }
      })
      expect(updateUserSpy).toHaveBeenCalledWith(userId, {
        emailVerified: true
      })
      expect(result).toBe(true)
    })

    it('should return false if job does not exist', async () => {
      const getJobSpy = jest
        .spyOn(emailQueue, 'getJob')
        .mockResolvedValue(undefined)

      const userId = '123'
      const token = 'abc'

      const result = await userService.validateEmail(userId, token)

      expect(getJobSpy).toHaveBeenCalledWith(`${userId}-${token}`)
      expect(result).toBe(false)
    })
  })
})
