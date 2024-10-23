import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { EmailService } from './email.service'

describe('EmailService', () => {
  const OLD_ENV = process.env
  let emailService: EmailService, mailerService: DeepMockProxy<MailerService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockDeep<MailerService>()
        }
      ]
    }).compile()
    mailerService = module.get<MailerService>(
      MailerService
    ) as DeepMockProxy<MailerService>
    emailService = module.get<EmailService>(EmailService)
    process.env = { ...OLD_ENV } // make a copy
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
  })

  const email = {
    to: 'test@gooddomain.com',
    subject: 'Test Subject',
    text: 'Test Body',
    html: 'Test Html'
  }

  it('should send email', async () => {
    mailerService.sendMail.mockResolvedValue(undefined)

    await emailService.sendEmail(email)

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })

  it('should throw error with example email address', async () => {
    process.env.SMTP_URL = 'smtp://example.com'
    process.env.NODE_ENV = 'production'
    await expect(
      emailService.sendEmail({ ...email, to: 'test@example.com' })
    ).rejects.toThrow('Example email address')
  })
})
