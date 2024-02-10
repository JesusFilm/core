import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'
import { mockDeep } from 'jest-mock-extended'

import { UserJourney } from '.prisma/api-journeys-client'
import { EmailService } from '@core/nest/common/email/emailService'

import { UserJourneyRole, UserTeamRole } from '../../__generated__/graphql'

import {
  EmailConsumer,
  JourneyAccessRequest,
  JourneyEditInviteJob,
  JourneyRequestApproved,
  TeamInviteAccepted,
  TeamInviteJob,
  TeamRemoved
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

jest.mock('@apollo/client')

const teamRemoved: Job<TeamRemoved, unknown, string> = {
  name: 'team-removed',
  data: {
    teamName: 'test-team',
    userId: 'userId',
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    }
  }
} as unknown as Job<TeamRemoved, unknown, string>

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

const teamInviteAccepted: Job<TeamInviteAccepted, unknown, string> = {
  name: 'team-invite-accepted',
  data: {
    team: {
      id: 'teamId',
      title: 'Team Title',
      userTeams: [
        {
          id: 'userTeamId',
          teamId: 'teamId',
          userId: 'userId',
          role: UserTeamRole.manager
        },
        {
          id: 'userTeamId2',
          teamId: 'teamId',
          userId: 'userId2',
          role: UserTeamRole.manager
        }
      ]
    },
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    },
    url: 'http://example.com/'
  }
} as unknown as Job<TeamInviteAccepted, unknown, string>

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

const journeyAccessRequest: Job<JourneyAccessRequest, unknown, string> = {
  name: 'journey-access-request',
  data: {
    userId: 'userId',
    journey: {
      id: 'journeyId',
      title: 'Journey Title',
      userJourneys: [
        {
          id: 'userJourneyId',
          userId: 'userId2',
          journeyId: 'journeyId',
          role: UserJourneyRole.owner
        }
      ] as UserJourney[]
    },
    url: 'http://example.com/journey/journeyId',
    sender: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    }
  }
} as unknown as Job<JourneyAccessRequest, unknown, string>

const journeyEditJob: Job<JourneyEditInviteJob, unknown, string> = {
  name: 'journey-edit-invite',
  data: {
    email: 'jsmith@example.com',
    journeyTitle: 'test-journey',
    url: 'http://example.com/journey/journeyId',
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
          provide: EmailService,
          useValue: mockDeep<EmailService>()
        }
      ]
    }).compile()
    mailerService = module.get<MailerService>(MailerService)
    emailConsumer = module.get<EmailConsumer>(EmailConsumer)
    emailService = module.get<EmailService>(EmailService)
    mailerService.sendMail = jest
      .fn()
      .mockImplementation(async () => await Promise.resolve())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('process', () => {
    it('should handle team-removed', async () => {
      emailConsumer.teamRemovedEmail = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(teamRemoved)
      expect(emailConsumer.teamRemovedEmail).toHaveBeenCalledWith(teamRemoved)
    })

    it('should handle team-invite', async () => {
      emailConsumer.teamInviteEmail = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(teamInviteJob)
      expect(emailConsumer.teamInviteEmail).toHaveBeenCalledWith(teamInviteJob)
    })

    it('should handle team-invite-accepted', async () => {
      emailConsumer.teamInviteAcceptedEmail = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(teamInviteAccepted)
      expect(emailConsumer.teamInviteAcceptedEmail).toHaveBeenCalledWith(
        teamInviteAccepted
      )
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

    it('should handle journey-access-request', async () => {
      emailConsumer.journeyAccessRequest = jest
        .fn()
        .mockImplementationOnce(async () => await Promise.resolve())
      await emailConsumer.process(journeyAccessRequest)
      expect(emailConsumer.journeyAccessRequest).toHaveBeenCalledWith(
        journeyAccessRequest
      )
    })
  })

  describe('teamRemovedEmail', () => {
    it('should send an email', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.teamRemovedEmail(teamRemoved)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'You have been removed from team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('teamInviteEmail', () => {
    it('should send an email if user exists', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
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

    it('should send an email if user does not exist', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: undefined
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.teamInviteEmail(teamInviteJob)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('teamInviteAcceptedEmail', () => {
    it('should send an email', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.teamInviteAcceptedEmail(teamInviteAccepted)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(2)
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Joe has been added to your team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('journeyAccessRequest', () => {
    it('should send an email', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.journeyAccessRequest(journeyAccessRequest)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Joe requests access to a journey',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('journeyRequestApproved', () => {
    it('should send an email', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.journeyRequestApproved(journeyRequestApproved)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Why Jesus? has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })
  })

  describe('journeyEditInvite', () => {
    it('should send an email if user exists', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: {
                id: 'userid',
                email: 'jsmith@exmaple.com'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
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
        to: journeyEditJob.data.email,
        subject: 'test-journey has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should send an email if user does not exist', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: undefined
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      let args = {}
      emailService.sendEmail = jest
        .fn()
        .mockImplementation(async (callArgs) => {
          args = callArgs
          await Promise.resolve()
        })
      await emailConsumer.journeyEditInvite(journeyEditJob)
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: journeyEditJob.data.email,
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
      await emailService.sendEmail(email)

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
})
