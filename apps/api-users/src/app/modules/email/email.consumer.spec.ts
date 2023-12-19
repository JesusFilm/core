import { Test, TestingModule } from '@nestjs/testing'
import { SES } from 'aws-sdk'
import { Job } from 'bullmq'

import { User } from '.prisma/api-users-client'

import { PrismaService } from '../../lib/prisma.service'

import { EmailConsumer, EmailJob } from './email.consumer'

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn()
            }
          }
        }
      ]
    }).compile()

    emailConsumer = module.get<EmailConsumer>(EmailConsumer)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it.skip('should send email successfully', async () => {
    const job = {
      data: {
        userId: 'user-id',
        subject: 'Test Subject',
        body: 'Test Body'
      },
      name: 'email-job'
    } as unknown as Job<EmailJob, any, string>

    const user = {
      email: 'test@example.com'
    } as unknown as User

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)
    // Mock the SES sendEmail method
    const sendEmailMock = jest.fn().mockReturnValue({ promise: jest.fn() })
    jest.mock('aws-sdk', () => ({
      SES: jest.fn().mockImplementation(() => ({
        sendEmail: sendEmailMock
      }))
    }))

    await emailConsumer.process(job)

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: job.data.userId }
    })
    expect(SES.prototype.sendEmail).toHaveBeenCalledWith({
      Source: 'support@nextstep.is',
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: job.data.subject
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: job.data.body
          }
        }
      }
    })
  })

  it('should throw an error if user is not found', async () => {
    const job = {
      data: {
        userId: 'non-existing-user-id',
        subject: 'Test Subject',
        body: 'Test Body'
      },
      name: 'email-job'
    } as unknown as Job<EmailJob, unknown, string>

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

    await expect(emailConsumer.process(job)).rejects.toThrow('User not found')
  })
})
