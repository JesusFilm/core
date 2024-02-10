import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'
import { mockDeep } from 'jest-mock-extended'

import { EmailService } from '@core/nest/common/emailService'

import { PrismaService } from '../../lib/prisma.service'

import { ApiUsersJob, EmailConsumer } from './email.consumer'

const job = {
  data: {
    userId: 'user-id',
    email: 'test@example.com',
    token: '123456'
  },
  name: 'verifyUser'
}

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer
  let emailService: EmailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: MailerService,
          useValue: mockDeep<MailerService>()
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn()
            }
          }
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>()
        }
      ]
    }).compile()

    emailService = module.get<EmailService>(EmailService)
    emailConsumer = module.get<EmailConsumer>(EmailConsumer)
    emailService.sendEmail = jest.fn()
  })

  describe('process', () => {
    it('should call verifyUser', async () => {
      emailConsumer.verifyUser = jest.fn()

      await emailConsumer.process(job as Job<ApiUsersJob>)
      expect(emailConsumer.verifyUser).toHaveBeenCalledWith(job)
    })
  })

  describe('verifyUser', () => {
    it('should send email successfully', async () => {
      jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(async () => await Promise.resolve())

      await emailConsumer.verifyUser(job as Job<ApiUsersJob>)

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: job.data.email,
        subject: 'Verify your email address on Next Steps',
        text: expect.any(String),
        html: expect.anything()
      })
    })
  })
})
