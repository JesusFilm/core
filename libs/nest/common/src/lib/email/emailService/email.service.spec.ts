import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { mockDeep } from 'jest-mock-extended'

import { EmailService } from './email.service'

const sendEmailMock = jest.fn().mockReturnValue({})
// Mock the SES sendEmail method
jest.mock('@aws-sdk/client-ses', () => ({
  SES: jest.fn().mockImplementation(() => ({
    sendEmail: sendEmailMock
  }))
}))

describe('EmailService', () => {
  let emailService: EmailService
  let mailerService: MailerService

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
    mailerService = module.get<MailerService>(MailerService)
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

  it('should send email using mailerService when SMTP_URL is defined', async () => {
    process.env.SMTP_URL = 'smtp://example.com' // from now on the env var is test

    const mailerSpy = jest
      .spyOn(mailerService, 'sendMail')
      .mockResolvedValue(undefined)

    await emailService.sendEmail(email)

    expect(mailerSpy).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })

  it('should process the email job', async () => {
    const OLD_ENV = process.env
    process.env = {
      ...OLD_ENV,
      SMTP_URL: undefined
    }

    await emailService.sendEmail(email)

    expect(sendEmailMock).toHaveBeenCalledWith({
      Source: 'support@nextstep.is',
      Destination: { ToAddresses: [email.to] },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: email.subject
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: email.html
          },
          Text: {
            Charset: 'UTF-8',
            Data: email.text
          }
        }
      }
    })
    process.env = OLD_ENV
  })
})
