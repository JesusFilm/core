import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { EmailService } from '@core/nest/common/email/emailService'

import EmailVerifyEmail from '../../emails/templates/EmailVerify/EmailVerify'
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

const jobWithAlias = {
  data: {
    userId: 'user-id',
    email: 'test+1@example.com',
    token: '123456'
  },
  name: 'verifyUser'
}

const jobWithRedirect = {
  data: {
    userId: 'user-id',
    email: 'test@example.com',
    token: '123456',
    redirect: '/templates/templateId?createNew=true&newAccount=true'
  },
  name: 'verifyUser'
}

const jobWithRedirectInUrl = {
  data: {
    userId: 'user-id',
    email: 'test@example.com',
    token: '123456',
    redirect: '?redirect=/templates/templateId?createNew=true&newAccount=true'
  },
  name: 'verifyUser'
}

jest.mock('../../emails/templates/EmailVerify/EmailVerify')

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer
  let emailService: EmailService
  let prismaService: DeepMockProxy<PrismaService>

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
          useValue: mockDeep<EmailService>()
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>()
        }
      ]
    }).compile()

    emailService = module.get<EmailService>(EmailService)
    emailConsumer = module.get<EmailConsumer>(EmailConsumer)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    emailService.sendEmail = jest.fn()
  })

  afterEach(() => jest.clearAllMocks())

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
      prismaService.user.findUnique.mockResolvedValueOnce({
        id: 'userId',
        firstName: 'Joe',
        lastName: 'Ron-Imo',
        imageUrl: null,
        email: 'test@example.com',
        userId: 'userUserId',
        createdAt: new Date(),
        superAdmin: false,
        emailVerified: false
      })
      await emailConsumer.verifyUser(job as Job<ApiUsersJob>)

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: job.data.email,
        subject: 'Verify your email address on Next Steps',
        text: expect.any(String),
        html: expect.anything()
      })
    })

    it('should allow email aliases', async () => {
      jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(async () => await Promise.resolve())
      prismaService.user.findUnique.mockResolvedValue({
        id: 'userId',
        firstName: 'Joe',
        lastName: 'Ron-Imo',
        imageUrl: null,
        email: 'test@example.com',
        userId: 'userUserId',
        createdAt: new Date(),
        superAdmin: false,
        emailVerified: false
      })

      await emailConsumer.verifyUser(jobWithAlias as Job<ApiUsersJob>)

      expect(EmailVerifyEmail).toHaveBeenCalledWith({
        inviteLink: expect.stringContaining(
          '/users/verify?token=123456&email=test%2B1@example.com'
        ),
        recipient: {
          email: 'test@example.com',
          firstName: 'Joe',
          imageUrl: undefined,
          lastName: 'Ron-Imo'
        },
        token: '123456'
      })
    })
  })

  it('should send email with redirect', async () => {
    jest
      .spyOn(emailService, 'sendEmail')
      .mockImplementation(async () => await Promise.resolve())
    prismaService.user.findUnique.mockResolvedValue({
      id: 'userId',
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: null,
      email: 'test@example.com',
      userId: 'userUserId',
      createdAt: new Date(),
      superAdmin: false,
      emailVerified: false
    })

    await emailConsumer.verifyUser(jobWithRedirect as Job<ApiUsersJob>)

    expect(EmailVerifyEmail).toHaveBeenCalledWith({
      inviteLink: expect.stringContaining(
        '/users/verify?token=123456&email=test@example.com&redirect=/templates/templateId?createNew=true&newAccount=true'
      ),
      recipient: {
        email: 'test@example.com',
        firstName: 'Joe',
        imageUrl: undefined,
        lastName: 'Ron-Imo'
      },
      token: '123456'
    })
  })

  it('should check if url has redirect', async () => {
    jest
      .spyOn(emailService, 'sendEmail')
      .mockImplementation(async () => await Promise.resolve())
    prismaService.user.findUnique.mockResolvedValue({
      id: 'userId',
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: null,
      email: 'test@example.com',
      userId: 'userUserId',
      createdAt: new Date(),
      superAdmin: false,
      emailVerified: false
    })

    await emailConsumer.verifyUser(jobWithRedirectInUrl as Job<ApiUsersJob>)

    expect(EmailVerifyEmail).toHaveBeenCalledWith({
      inviteLink: expect.stringContaining(
        '/users/verify?token=123456&email=test@example.com&redirect=/templates/templateId?createNew=true&newAccount=true'
      ),
      recipient: {
        email: 'test@example.com',
        firstName: 'Joe',
        imageUrl: undefined,
        lastName: 'Ron-Imo'
      },
      token: '123456'
    })
  })
})
