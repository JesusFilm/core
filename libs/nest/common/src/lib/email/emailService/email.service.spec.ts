import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { EmailService } from './email.service'

const sendEmailMock = jest.fn().mockReturnValue({})
// Mock the SES sendEmail method
jest.mock('@aws-sdk/client-ses', () => ({
  SES: jest.fn().mockImplementation(() => ({
    sendEmail: sendEmailMock
  }))
}))

describe('EmailService', () => {
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const email = {
    to: 'text@xample.com',
    subject: 'Test Subject',
    text: 'Test Body',
    html: 'Test Html'
  }

  it('should send email using mailerService', async () => {
    mailerService.sendMail.mockResolvedValue(undefined)

    await emailService.sendEmail(email)

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })
})
