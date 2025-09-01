import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { Job } from 'bullmq'

import {
  Team,
  UserJourney,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { sendEmail } from '@core/yoga/email'

import { prismaMock } from '../../../../test/prismaMock'

import {
  JourneyAccessRequest,
  JourneyEditInviteJob,
  JourneyRequestApproved,
  TeamInviteAccepted,
  TeamInviteJob,
  TeamRemoved
} from './prisma.types'
import { service } from './service'

jest.mock('@apollo/client')

let args = {}
jest.mock('@core/yoga/email', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockImplementation(async (callArgs) => {
    args = callArgs
    await Promise.resolve()
  })
}))

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
    team: {
      id: 'teamId',
      title: 'test-team'
    } as unknown as Team,
    email: 'abc@example.com',
    sender: {
      id: 'senderId',
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      email: 'sender@example.com',
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
      id: 'senderId',
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      email: 'sender@example.com',
      imageUrl: undefined
    }
  }
} as unknown as Job<TeamInviteAccepted, unknown, string>

const journeyRequestApproved: Job<JourneyRequestApproved, unknown, string> = {
  name: 'journey-request-approved',
  data: {
    userId: 'userId',
    journey: {
      id: 'journeyId',
      title: 'Journey Title',
      team: {
        title: 'Ukrainian outreach team Odessa'
      },
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
} as unknown as Job<JourneyRequestApproved, unknown, string>

const journeyAccessRequest: Job<JourneyAccessRequest, unknown, string> = {
  name: 'journey-access-request',
  data: {
    userId: 'userId',
    journey: {
      id: 'journeyId',
      title: 'Journey Title',
      team: {
        title: 'Ukrainian outreach team Odessa'
      },
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
    journey: {
      id: 'journeyId',
      title: 'Journey Title',
      team: {
        title: 'Ukrainian outreach team Odessa'
      },
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
} as unknown as Job<JourneyEditInviteJob, unknown, string>

describe('EmailConsumer', () => {
  afterEach(() => {
    jest.clearAllMocks()
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
      await service(teamRemoved)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'You have been removed from team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValueOnce({
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

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
      await service(teamRemoved)
      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('teamInviteEmail', () => {
    it('should send an email if user exists', async () => {
      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementation(async (options) => {
          // Mock for fetchSenderData call
          if (options.variables?.userId === 'senderId') {
            return await Promise.resolve({
              data: {
                user: {
                  id: 'senderId',
                  email: 'sender@example.com',
                  firstName: 'Joe',
                  lastName: 'Ron-Imo',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          // Mock for userByEmail call
          if (options.variables?.email === 'abc@example.com') {
            return await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'userid',
                  email: 'abc@example.com',
                  firstName: 'John',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          throw new Error('Unexpected query')
        })
      await service(teamInviteJob)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should send an email if user does not exist', async () => {
      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementation(async (options) => {
          // Mock for fetchSenderData call
          if (options.variables?.userId === 'senderId') {
            return await Promise.resolve({
              data: {
                user: {
                  id: 'senderId',
                  email: 'sender@example.com',
                  firstName: 'Joe',
                  lastName: 'Ron-Imo',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          // Mock for userByEmail call - user doesn't exist
          if (options.variables?.email === 'abc@example.com') {
            return await Promise.resolve({
              data: {
                userByEmail: undefined
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          throw new Error('Unexpected query')
        })
      await service(teamInviteJob)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValueOnce({
        email: 'abc@example.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementation(async (options) => {
          // Mock for fetchSenderData call
          if (options.variables?.userId === 'senderId') {
            return await Promise.resolve({
              data: {
                user: {
                  id: 'senderId',
                  email: 'sender@example.com',
                  firstName: 'Joe',
                  lastName: 'Ron-Imo',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          // Mock for userByEmail call
          if (options.variables?.email === 'abc@example.com') {
            return await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'userid',
                  email: 'abc@example.com',
                  firstName: 'John',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          throw new Error('Unexpected query')
        })

      await service(teamInviteJob)
      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('teamInviteAcceptedEmail', () => {
    it('should send an email', async () => {
      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementation(async (options) => {
          // Mock for fetchSenderData call
          if (options.variables?.userId === 'senderId') {
            return await Promise.resolve({
              data: {
                user: {
                  id: 'senderId',
                  email: 'sender@example.com',
                  firstName: 'Joe',
                  lastName: 'Ron-Imo',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          // Mock for recipient user calls (for both managers)
          if (
            options.variables?.userId === 'userId' ||
            options.variables?.userId === 'userId2'
          ) {
            return await Promise.resolve({
              data: {
                user: {
                  id: options.variables?.userId,
                  email: 'jsmith@exmaple.com',
                  firstName: 'John',
                  lastName: 'Smith',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          throw new Error('Unexpected query')
        })
      await service(teamInviteAccepted)
      expect(sendEmail).toHaveBeenCalledTimes(2)
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Joe has been added to your team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValue({
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementation(async (options) => {
          // Mock for fetchSenderData call
          if (options.variables?.userId === 'senderId') {
            return await Promise.resolve({
              data: {
                user: {
                  id: 'senderId',
                  email: 'sender@example.com',
                  firstName: 'Joe',
                  lastName: 'Ron-Imo',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          // Mock for recipient user calls (for both managers)
          if (
            options.variables?.userId === 'userId' ||
            options.variables?.userId === 'userId2'
          ) {
            return await Promise.resolve({
              data: {
                user: {
                  id: options.variables?.userId,
                  email: 'jsmith@exmaple.com',
                  firstName: 'John',
                  lastName: 'Smith',
                  imageUrl: undefined
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
          }
          throw new Error('Unexpected query')
        })
      await service(teamInviteAccepted)
      expect(sendEmail).not.toHaveBeenCalled()
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
      await service(journeyAccessRequest)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Joe requests access to a journey',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValueOnce({
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

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
      await service(journeyAccessRequest)
      expect(sendEmail).not.toHaveBeenCalled()
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
      await service(journeyRequestApproved)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: 'jsmith@exmaple.com',
        subject: 'Journey Title has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValueOnce({
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

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
      await service(journeyRequestApproved)
      expect(sendEmail).not.toHaveBeenCalled()
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
      await service(journeyEditJob)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: journeyEditJob.data.email,
        subject: 'Journey Title has been shared with you',
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
      await service(journeyEditJob)
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: journeyEditJob.data.email,
        subject: 'Journey Title has been shared with you',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should not send email if user preference is false', async () => {
      prismaMock.journeysEmailPreference.findFirst.mockResolvedValueOnce({
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

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
      await service(journeyEditJob)
      expect(sendEmail).not.toHaveBeenCalled()
    })
  })
})
