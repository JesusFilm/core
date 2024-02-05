import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'
import { mockDeep } from 'jest-mock-extended'

import {
  EmailConsumer,
  JourneyEditInviteJob,
  JourneyRequestApproved,
  TeamInviteJob
} from './email.consumer'

const sendEmailMock = jest.fn().mockReturnValue({ promise: jest.fn() })
// Mock the SES sendEmail method
jest.mock('aws-sdk', () => ({
  config: {
    update() {
      return {}
    }
  },
  SES: jest.fn().mockImplementation(() => ({
    sendEmail: sendEmailMock
  }))
}))

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ApolloClient: jest.fn().mockImplementation(() => {
      return {
        query: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'userid',
              email: 'jsmith@exmaple.com'
            }
          }
        })
      }
    }),
    InMemoryCache: jest.fn(),
    gql: originalModule.gql
  }
})

const teamInviteJob: Job<TeamInviteJob, unknown, string> = {
  name: 'team-invite',
  data: {
    teamName: 'test-team',
    email: 'abc@example.com',
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    }
  }
} as unknown as Job<TeamInviteJob, unknown, string>

const journeyRequestApproved: Job<JourneyRequestApproved, unknown, string> = {
  name: 'journey-request-approved',
  data: {
    userId: 'userId',
    journeyTitle: 'Why Jesus?',
    url: 'http://example.com/journey/journeyId',
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    }
  }
} as unknown as Job<JourneyRequestApproved, unknown, string>

const journeyEditJob: Job<JourneyEditInviteJob, unknown, string> = {
  name: 'journey-edit-invite',
  data: {
    email: 'abc@example.com',
    journeyTitle: 'test-journey',
    url: 'http://example.com',
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    }
  }
} as unknown as Job<JourneyEditInviteJob, unknown, string>

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer
  let mailerService: MailerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: MailerService,
          useValue: mockDeep<MailerService>()
        }
      ]
    }).compile()
    mailerService = module.get<MailerService>(MailerService)
    emailConsumer = module.get<EmailConsumer>(EmailConsumer)
    mailerService.sendMail = jest
      .fn()
      .mockImplementation(async () => await Promise.resolve())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('process', () => {
    it('should handle team-invite', async () => {
      emailConsumer.teamInviteEmail = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(teamInviteJob)
      expect(emailConsumer.teamInviteEmail).toHaveBeenCalledWith(teamInviteJob)
    })

    it('should handle journey-request-approved', async () => {
      emailConsumer.journeyRequestApproved = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(journeyRequestApproved)
      expect(emailConsumer.journeyRequestApproved).toHaveBeenCalledWith(
        journeyRequestApproved
      )
    })

    it('should handle journey-edit-invite', async () => {
      emailConsumer.journeyEditInvite = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(journeyEditJob)
      expect(emailConsumer.journeyEditInvite).toHaveBeenCalledWith(
        journeyEditJob
      )
    })
  })

  describe('teamInviteEmail', () => {
    it('should send an email', async () => {
      let args = {}
      emailConsumer.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.teamInviteEmail(teamInviteJob)
      expect(emailConsumer.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('journeyRequestApproved', () => {
    it('should send an email', async () => {
      let args = {}
      emailConsumer.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.journeyRequestApproved(journeyRequestApproved)
      expect(emailConsumer.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Why Jesus? has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('journeyEditInvite', () => {
    it('should send an email', async () => {
      let args = {}
      emailConsumer.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.journeyEditInvite(journeyEditJob)
      expect(emailConsumer.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'test-journey has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('sendEmail', () => {
    const email = {
      to: 'text@example.com',
      subject: 'Test Subject',
      text: 'Test Body',
      html: 'Test Html'
    }

    it('should send email using mailerService when SMTP_URL is defined', async () => {
      process.env.SMTP_URL = 'smtp://example.com' // from now on the env var is test

      const sendMailSpy = jest.spyOn(mailerService, 'sendMail')
      await emailConsumer.sendEmail(email)

      expect(sendMailSpy).toHaveBeenCalledWith({
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

      await emailConsumer.sendEmail(email)

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
})
