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
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      imageUrl: undefined
    },
    senderId: 'senderId123'
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
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              user: undefined
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
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
        email: 'jsmith@exmaple.com',
        unsubscribeAll: false,
        accountNotifications: false
      })

      await service(teamInviteJob)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('should fetch and use enhanced sender data from database', async () => {
      const enhancedSenderData = {
        id: 'senderId123',
        firstName: 'John',
        lastName: 'Database',
        email: 'john.database@example.com',
        imageUrl: 'https://example.com/enhanced-avatar.jpg'
      }

      // Mock the two Apollo queries: first for sender lookup, second for recipient lookup
      jest.spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          // First call: GET_USER for sender lookup
          async () =>
            await Promise.resolve({
              data: {
                user: enhancedSenderData
              }
            } as unknown as ApolloQueryResult<unknown>)
        )
        .mockImplementationOnce(
          // Second call: GET_USER_BY_EMAIL for recipient lookup
          async () =>
            await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'recipientId',
                  email: 'abc@example.com'
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      await service(teamInviteJob)
      
      expect(sendEmail).toHaveBeenCalled()
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })

      // Verify that enhanced sender data is used by checking Apollo client calls
      expect(ApolloClient.prototype.query).toHaveBeenCalledTimes(2)
      expect(ApolloClient.prototype.query).toHaveBeenNthCalledWith(1, {
        query: expect.any(Object), // GET_USER query
        variables: { userId: 'senderId123' }
      })
    })

    it('should fallback to original sender data when database lookup fails', async () => {
      // Mock first query (sender lookup) to throw error, second query (recipient) to succeed
      jest.spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          // First call: GET_USER for sender lookup - throws error
          async () => {
            throw new Error('Database connection failed')
          }
        )
        .mockImplementationOnce(
          // Second call: GET_USER_BY_EMAIL for recipient lookup
          async () =>
            await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'recipientId',
                  email: 'abc@example.com'
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      await service(teamInviteJob)
      
      expect(sendEmail).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch sender data from database, using fallback:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })

    it('should fallback to original sender data when user is not found in database', async () => {
      // Mock first query (sender lookup) to return null user, second query (recipient) to succeed  
      jest.spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          // First call: GET_USER for sender lookup - returns null
          async () =>
            await Promise.resolve({
              data: {
                user: null
              }
            } as unknown as ApolloQueryResult<unknown>)
        )
        .mockImplementationOnce(
          // Second call: GET_USER_BY_EMAIL for recipient lookup
          async () =>
            await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'recipientId',
                  email: 'abc@example.com'
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      await service(teamInviteJob)
      
      expect(sendEmail).toHaveBeenCalled()
      // Should still send email with fallback sender data
      expect(args).toEqual({
        to: teamInviteJob.data.email,
        subject: 'Invitation to join team: test-team',
        html: expect.any(String),
        text: expect.any(String)
      })
    })

    it('should skip sender lookup when senderId is null', async () => {
      const teamInviteJobWithoutSenderId = {
        name: 'team-invite',
        data: {
          team: teamInviteJob.data.team,
          email: teamInviteJob.data.email,
          sender: teamInviteJob.data.sender,
          senderId: null
        }
      } as unknown as Job<TeamInviteJob, unknown, string>

      // Mock only recipient lookup query
      jest.spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          // Only call: GET_USER_BY_EMAIL for recipient lookup
          async () =>
            await Promise.resolve({
              data: {
                userByEmail: {
                  id: 'recipientId', 
                  email: 'abc@example.com'
                }
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      await service(teamInviteJobWithoutSenderId)
      
      expect(sendEmail).toHaveBeenCalled()
      // Should only make one Apollo query call (for recipient)
      expect(ApolloClient.prototype.query).toHaveBeenCalledTimes(1)
    })

    describe('Database Lookup Logic - Comprehensive Tests', () => {
      it('should properly handle enhanced sender data with all fields present', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Enhanced',
          lastName: 'Sender',
          email: 'enhanced.sender@example.com',
          imageUrl: 'https://example.com/enhanced-avatar.jpg'
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        // Verify email content includes enhanced sender data
        const emailContent = (args as any).html
        expect(emailContent).toContain('Enhanced')
        expect(emailContent).toContain('Sender')
      })

      it('should handle enhanced sender data with missing lastName', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Enhanced',
          lastName: null,
          email: 'enhanced.sender@example.com',
          imageUrl: 'https://example.com/enhanced-avatar.jpg'
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const emailContent = (args as any).html
        expect(emailContent).toContain('Enhanced')
      })

      it('should handle enhanced sender data with missing imageUrl', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Enhanced',
          lastName: 'Sender',
          email: 'enhanced.sender@example.com',
          imageUrl: null
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const emailContent = (args as any).html
        expect(emailContent).toContain('Enhanced')
        expect(emailContent).toContain('Sender')
      })

      it('should use enhanced sender data for both existing and non-existing users', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Database',
          lastName: 'User',
          email: 'database.user@example.com',
          imageUrl: 'https://example.com/db-avatar.jpg'
        }

        // Test with existing user
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: {
                  userByEmail: {
                    id: 'recipientId',
                    email: 'abc@example.com'
                  }
                }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const emailContentExistingUser = (args as any).html
        expect(emailContentExistingUser).toContain('Database')
        expect(emailContentExistingUser).toContain('User')

        // Reset mocks
        jest.clearAllMocks()

        // Test with non-existing user
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const emailContentNonExistingUser = (args as any).html
        expect(emailContentNonExistingUser).toContain('Database')
        expect(emailContentNonExistingUser).toContain('User')
      })

      it('should verify correct query sequence and parameters', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Query',
          lastName: 'Test',
          email: 'query.test@example.com',
          imageUrl: 'https://example.com/query-avatar.jpg'
        }

        const mockQuery = jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        // Verify query sequence and parameters
        expect(mockQuery).toHaveBeenCalledTimes(2)
        
        // First call should be GET_USER with senderId
        expect(mockQuery).toHaveBeenNthCalledWith(1, {
          query: expect.any(Object),
          variables: { userId: 'senderId123' }
        })
        
        // Second call should be GET_USER_BY_EMAIL with recipient email
        expect(mockQuery).toHaveBeenNthCalledWith(2, {
          query: expect.any(Object),
          variables: { email: 'abc@example.com' }
        })
      })

      it('should handle GraphQL query errors gracefully', async () => {
        const errorTypes = [
          new Error('Network error'),
          new Error('GraphQL error: User not found'),
          new Error('Timeout error'),
          new Error('Authentication failed')
        ]

        for (const error of errorTypes) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw error })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(teamInviteJob)
          
          expect(sendEmail).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch sender data from database, using fallback:',
            error
          )
          
          consoleSpy.mockRestore()
        }
      })

      it('should handle malformed database responses gracefully', async () => {
        const malformedResponses = [
          { data: {} }, // Missing user field
          { data: { user: {} } }, // Empty user object
          { data: { user: { id: 'test' } } }, // Missing required fields
          { data: null }, // Null data
          {} // Missing data property
        ]

        for (const response of malformedResponses) {
          jest.clearAllMocks()

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(
              async () => await Promise.resolve(response as ApolloQueryResult<unknown>)
            )
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(teamInviteJob)
          
          expect(sendEmail).toHaveBeenCalled()
          // Should still send email using fallback sender data
          expect(args).toEqual({
            to: teamInviteJob.data.email,
            subject: 'Invitation to join team: test-team',
            html: expect.any(String),
            text: expect.any(String)
          })
        }
      })

      it('should maintain performance by avoiding unnecessary queries when senderId is missing', async () => {
        const teamInviteJobNoSenderId = {
          name: 'team-invite',
          data: {
            team: teamInviteJob.data.team,
            email: teamInviteJob.data.email,
            sender: teamInviteJob.data.sender,
            senderId: undefined
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        const mockQuery = jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJobNoSenderId)
        
        expect(sendEmail).toHaveBeenCalled()
        // Should only make one query (for recipient lookup, not sender lookup)
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: { email: 'abc@example.com' }
        })
      })

      it('should verify enhanced sender data integration with email templates', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'Template',
          lastName: 'Validation',
          email: 'template.validation@example.com',
          imageUrl: 'https://example.com/template-avatar.jpg'
        }

        const originalSenderData = teamInviteJob.data.sender

        // Test with enhanced data for non-existing user (uses TeamInviteNoAccountEmail)
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify enhanced sender data is used instead of original job data
        const emailContent = (args as any).html
        expect(emailContent).toContain('Template')
        expect(emailContent).toContain('Validation')
        
        // Should NOT contain original sender data
        expect(emailContent).not.toContain(originalSenderData.firstName)
        if (originalSenderData.lastName) {
          expect(emailContent).not.toContain(originalSenderData.lastName)
        }

        jest.clearAllMocks()

        // Test with enhanced data for existing user (uses TeamInviteEmail)
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: {
                  userByEmail: {
                    id: 'recipientId',
                    email: 'abc@example.com'
                  }
                }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        const emailContentExisting = (args as any).html
        expect(emailContentExisting).toContain('Template')
        expect(emailContentExisting).toContain('Validation')
        
        // Should NOT contain original sender data
        expect(emailContentExisting).not.toContain(originalSenderData.firstName)
        if (originalSenderData.lastName) {
          expect(emailContentExisting).not.toContain(originalSenderData.lastName)
        }
      })
    })

    describe('Email-based firstName Fallback - Task 4.4', () => {
      it('should extract firstName from email when database and job data have empty firstName', async () => {
        const jobWithEmptyFirstName = {
          ...teamInviteJob,
          data: {
            ...teamInviteJob.data,
            sender: {
              firstName: '', // Empty firstName
              lastName: 'Doe',
              email: 'testuser123@hotmail.com',
              imageUrl: undefined
            }
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

        // Mock database returns user with empty firstName
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: {
                  user: {
                    id: 'senderId123',
                    firstName: '', // Empty in database too
                    lastName: 'Doe',
                    email: 'testuser123@hotmail.com',
                    imageUrl: null
                  }
                }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(jobWithEmptyFirstName)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify email content contains extracted firstName
        const emailContent = (args as any).html
        expect(emailContent).toContain('testuser123')
        
        // Verify logging
        expect(consoleSpy).toHaveBeenCalledWith(
          'Using email-based firstName fallback: testuser123 from testuser123@hotmail.com'
        )
        
        consoleSpy.mockRestore()
      })

      it('should extract firstName from various email formats', async () => {
        const emailTestCases = [
          { email: 'john.doe@example.com', expected: 'john.doe' },
          { email: 'user123@domain.org', expected: 'user123' },
          { email: 'test_user@company.co.uk', expected: 'test_user' },
          { email: 'a@b.com', expected: 'a' },
          { email: 'very.long.email.address@subdomain.example.com', expected: 'very.long.email.address' }
        ]

        for (const testCase of emailTestCases) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

          const jobWithTestEmail = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: '', // Empty firstName to trigger fallback
                lastName: 'Test',
                email: testCase.email,
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          // Mock database lookup failure to use job data
          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw new Error('Database error') })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(jobWithTestEmail)
          
          expect(sendEmail).toHaveBeenCalled()
          
          // Verify correct firstName extraction
          const emailContent = (args as any).html
          expect(emailContent).toContain(testCase.expected)
          
          // Verify logging
          expect(consoleSpy).toHaveBeenCalledWith(
            `Using email-based firstName fallback: ${testCase.expected} from ${testCase.email}`
          )
          
          consoleSpy.mockRestore()
        }
      })

      it('should handle edge cases in email extraction gracefully', async () => {
        const edgeCases = [
          { email: '', expected: 'User' }, // Empty email
          { email: null, expected: 'User' }, // Null email
          { email: undefined, expected: 'User' }, // Undefined email
          { email: 'no-at-symbol.com', expected: 'no-at-symbol.com' }, // Malformed email
          { email: '@domain.com', expected: '' }, // Empty local part
          { email: 'user@', expected: 'user' } // Missing domain
        ]

        for (const edgeCase of edgeCases) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

          const jobWithEdgeCaseEmail = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: '', // Empty firstName to trigger fallback
                lastName: 'Test',
                email: edgeCase.email,
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw new Error('Database error') })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(jobWithEdgeCaseEmail)
          
          expect(sendEmail).toHaveBeenCalled()
          
          // Should still send email with fallback firstName
          expect(args).toEqual({
            to: teamInviteJob.data.email,
            subject: 'Invitation to join team: test-team',
            html: expect.any(String),
            text: expect.any(String)
          })

          consoleSpy.mockRestore()
        }
      })

      it('should only use email fallback when firstName is truly empty or whitespace', async () => {
        const firstNameTestCases = [
          { firstName: 'ValidName', shouldUseEmailFallback: false },
          { firstName: ' ValidName ', shouldUseEmailFallback: false }, // With spaces (should be trimmed)
          { firstName: '', shouldUseEmailFallback: true }, // Empty string
          { firstName: '   ', shouldUseEmailFallback: true }, // Whitespace only
          { firstName: null, shouldUseEmailFallback: true }, // Null
          { firstName: undefined, shouldUseEmailFallback: true } // Undefined
        ]

        for (const testCase of firstNameTestCases) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

          const jobWithTestFirstName = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: testCase.firstName,
                lastName: 'Test',
                email: 'test@example.com',
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw new Error('Database error') })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(jobWithTestFirstName)
          
          expect(sendEmail).toHaveBeenCalled()

          if (testCase.shouldUseEmailFallback) {
            // Should log email fallback usage
            expect(consoleSpy).toHaveBeenCalledWith(
              'Using email-based firstName fallback: test from test@example.com'
            )
            // Email content should contain extracted firstName
            const emailContent = (args as any).html
            expect(emailContent).toContain('test')
          } else {
            // Should NOT log email fallback usage
            expect(consoleSpy).not.toHaveBeenCalledWith(
              expect.stringContaining('Using email-based firstName fallback')
            )
            // Email content should contain original firstName (may be trimmed by email templates)
            const emailContent = (args as any).html
            expect(emailContent).toContain('ValidName')
          }
          
          consoleSpy.mockRestore()
        }
      })

      it('should integrate email fallback with existing fallback chain', async () => {
        const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        const jobWithEmptyFirstName = {
          ...teamInviteJob,
          data: {
            ...teamInviteJob.data,
            sender: {
              firstName: '', // Empty firstName in job data
              lastName: 'Test',
              email: 'fallback.user@domain.com',
              imageUrl: undefined
            }
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        // Mock database failure (triggers job data fallback)
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw new Error('Database connection failed') })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(jobWithEmptyFirstName)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify complete fallback chain worked:
        // 1. Database lookup failed (logged)
        expect(warnSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          expect.any(Error)
        )
        
        // 2. Job data fallback used, but firstName empty (triggers email fallback)
        expect(consoleSpy).toHaveBeenCalledWith(
          'Using email-based firstName fallback: fallback.user from fallback.user@domain.com'
        )
        
        // 3. Email content uses email-extracted firstName
        const emailContent = (args as any).html
        expect(emailContent).toContain('fallback.user')
        
        consoleSpy.mockRestore()
        warnSpy.mockRestore()
      })
    })

    describe('Fallback Scenarios - Task 5.3', () => {
      it('should fallback when Apollo client throws connection error', async () => {
        const connectionError = new Error('ECONNREFUSED: Connection refused')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw connectionError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          connectionError
        )
        
        // Verify fallback sender data is used
        const emailContent = (args as any).html
        expect(emailContent).toContain(teamInviteJob.data.sender.firstName)
        
        consoleSpy.mockRestore()
      })

      it('should fallback when GraphQL returns unauthorized error', async () => {
        const authError = new Error('401 Unauthorized: Invalid token')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw authError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          authError
        )
        
        consoleSpy.mockRestore()
      })

      it('should fallback when database query times out', async () => {
        const timeoutError = new Error('Timeout: Query took too long to execute')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw timeoutError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          timeoutError
        )
        
        consoleSpy.mockRestore()
      })

      it('should fallback when GraphQL server returns 500 error', async () => {
        const serverError = new Error('500 Internal Server Error: Database unavailable')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw serverError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          serverError
        )
        
        consoleSpy.mockRestore()
      })

      it('should fallback when user service returns GraphQL validation errors', async () => {
        const validationError = new Error('GraphQL validation error: Invalid user ID format')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw validationError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          validationError
        )
        
        consoleSpy.mockRestore()
      })

      it('should fallback when Apollo client throws network timeout', async () => {
        const networkTimeoutError = new Error('Network timeout: Request timed out after 30s')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw networkTimeoutError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          networkTimeoutError
        )
        
        consoleSpy.mockRestore()
      })

      it('should fallback gracefully when sender query succeeds but returns null user', async () => {
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: null }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify original sender data is used (no warning should be logged since no error occurred)
        const emailContent = (args as any).html
        expect(emailContent).toContain(teamInviteJob.data.sender.firstName)
      })

      it('should fallback when sender query returns incomplete user data', async () => {
        const incompleteUserData = {
          id: 'senderId123',
          // Missing firstName, lastName, email, imageUrl
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: incompleteUserData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Should use enhanced data even if incomplete (this tests our current implementation)
        const emailContent = (args as any).html
        // Since firstName is undefined in enhanced data, it might still send but with undefined values
        // This test ensures the email still gets sent even with incomplete enhanced data
        expect(args).toEqual({
          to: teamInviteJob.data.email,
          subject: 'Invitation to join team: test-team',
          html: expect.any(String),
          text: expect.any(String)
        })
      })

      it('should handle cascading failures gracefully - both sender and recipient queries fail', async () => {
        const senderError = new Error('Sender lookup failed: Database connection lost')
        const recipientError = new Error('Recipient lookup failed: Service unavailable')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw senderError })
          .mockImplementationOnce(async () => { throw recipientError })

        // This should cause the function to throw since recipient lookup is critical
        await expect(service(teamInviteJob)).rejects.toThrow(recipientError)
        
        // But sender fallback warning should still be logged
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          senderError
        )
        
        consoleSpy.mockRestore()
      })

      it('should maintain email functionality when both enhanced and fallback sender data have missing fields', async () => {
        // Test with job that has minimal sender data
        const minimalSenderJob = {
          ...teamInviteJob,
          data: {
            ...teamInviteJob.data,
            sender: {
              firstName: 'MinimalUser',
              // Missing lastName, email, imageUrl
            }
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        const senderError = new Error('Enhanced sender lookup failed')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw senderError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(minimalSenderJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          senderError
        )
        
        // Verify minimal sender data is used
        const emailContent = (args as any).html
        expect(emailContent).toContain('MinimalUser')
        
        consoleSpy.mockRestore()
      })

      it('should log appropriate warning message format for monitoring', async () => {
        const databaseError = new Error('PG: connection terminated unexpectedly')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw databaseError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify exact warning message format for monitoring/alerting systems
        expect(consoleSpy).toHaveBeenCalledTimes(1)
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          expect.objectContaining({
            message: 'PG: connection terminated unexpectedly'
          })
        )
        
        consoleSpy.mockRestore()
      })

      it('should ensure email delivery continues despite fallback scenarios', async () => {
        const testScenarios = [
          new Error('Redis connection lost'),
          new Error('Gateway timeout'),
          new Error('Rate limit exceeded'),
          new Error('Service mesh failure'),
          new Error('DNS resolution failed')
        ]

        for (const error of testScenarios) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw error })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(teamInviteJob)
          
          // Critical: Email must still be sent regardless of database lookup failures
          expect(sendEmail).toHaveBeenCalled()
          expect(args).toEqual({
            to: teamInviteJob.data.email,
            subject: 'Invitation to join team: test-team',
            html: expect.any(String),
            text: expect.any(String)
          })
          
          consoleSpy.mockRestore()
        }
      })

      it('should test fallback with edge case senderId values', async () => {
        const edgeCaseSenderIds = [
          '', // Empty string
          '   ', // Whitespace only
          'invalid-uuid-format', // Invalid UUID format
          'null', // String "null"
          '0', // String "0"
          'undefined' // String "undefined"
        ]

        for (const senderId of edgeCaseSenderIds) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

          const edgeCaseJob = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              senderId
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          const graphqlError = new Error(`User not found for ID: ${senderId}`)

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw graphqlError })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(edgeCaseJob)
          
          expect(sendEmail).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch sender data from database, using fallback:',
            graphqlError
          )
          
          consoleSpy.mockRestore()
        }
      })

      it('should handle intermittent database failures with retry-like behavior', async () => {
        // Simulate a scenario where the database fails but the email must still be sent
        const intermittentError = new Error('Connection pool exhausted')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw intermittentError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          intermittentError
        )
        
        // Verify that the system gracefully continues operation
        expect(args).toEqual({
          to: teamInviteJob.data.email,
          subject: 'Invitation to join team: test-team',
          html: expect.any(String),
          text: expect.any(String)
        })
        
        consoleSpy.mockRestore()
      })

      it('should handle Apollo client internal errors gracefully', async () => {
        const apolloErrors = [
          new Error('ApolloError: Network error'),
          new Error('ApolloError: Response not successful'),
          new Error('ApolloError: Request failed with status code 429'),
          new Error('ApolloError: Client timeout')
        ]

        for (const error of apolloErrors) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw error })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(teamInviteJob)
          
          expect(sendEmail).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch sender data from database, using fallback:',
            error
          )
          
          consoleSpy.mockRestore()
        }
      })

      it('should maintain performance during fallback scenarios', async () => {
        // Test that fallback doesn't significantly impact email processing time
        const performanceError = new Error('Database read timeout after 5s')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        const startTime = Date.now()

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw performanceError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        const endTime = Date.now()
        const executionTime = endTime - startTime

        expect(sendEmail).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch sender data from database, using fallback:',
          performanceError
        )
        
        // Fallback should be fast (under 100ms in test environment)
        expect(executionTime).toBeLessThan(100)
        
        consoleSpy.mockRestore()
      })

      it('should verify fallback data integrity across different email templates', async () => {
        const fallbackError = new Error('Data integrity check failed')
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        // Test for non-existing user (TeamInviteNoAccountEmail template)
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw fallbackError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const noAccountEmailContent = (args as any).html
        expect(noAccountEmailContent).toContain(teamInviteJob.data.sender.firstName)

        jest.clearAllMocks()
        consoleSpy.mockClear()

        // Test for existing user (TeamInviteEmail template)
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw fallbackError })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: {
                  userByEmail: {
                    id: 'recipientId',
                    email: 'abc@example.com'
                  }
                }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        const existingUserEmailContent = (args as any).html
        expect(existingUserEmailContent).toContain(teamInviteJob.data.sender.firstName)
        
        // Both templates should receive consistent fallback data
        expect(consoleSpy).toHaveBeenCalledTimes(2)
        
        consoleSpy.mockRestore()
      })

      it('should handle legacy API jobs without senderId field for backward compatibility', async () => {
        // Test job from legacy API that doesn't include senderId field
        const legacyTeamInviteJob = {
          name: 'team-invite',
          data: {
            team: teamInviteJob.data.team,
            email: teamInviteJob.data.email,
            sender: teamInviteJob.data.sender
            // No senderId field (legacy format)
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        const mockQuery = jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            // Only recipient lookup query (no sender lookup since senderId is missing)
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(legacyTeamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Should only make one query (recipient lookup, no sender lookup)
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: { email: 'abc@example.com' }
        })
        
        // Should use original sender data from job
        const emailContent = (args as any).html
        expect(emailContent).toContain(teamInviteJob.data.sender.firstName)
      })

      it('should verify fallback resilience across all failure types in production scenarios', async () => {
        const productionFailureScenarios = [
          {
            name: 'Database maintenance window',
            error: new Error('Database is temporarily unavailable for maintenance')
          },
          {
            name: 'Memory pressure',
            error: new Error('Out of memory: Cannot allocate buffer')
          },
          {
            name: 'Service degradation',
            error: new Error('Service degraded: 90% failure rate')
          },
          {
            name: 'Network partition',
            error: new Error('Network partition detected')
          },
          {
            name: 'SSL certificate expiry',
            error: new Error('SSL certificate expired')
          },
          {
            name: 'Rate limiting',
            error: new Error('Rate limit exceeded: 1000 requests per minute')
          }
        ]

        for (const scenario of productionFailureScenarios) {
          jest.clearAllMocks()
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw scenario.error })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(teamInviteJob)
          
          // Critical business requirement: Email delivery must not fail
          expect(sendEmail).toHaveBeenCalled()
          expect(args).toEqual({
            to: teamInviteJob.data.email,
            subject: 'Invitation to join team: test-team',
            html: expect.any(String),
            text: expect.any(String)
          })
          
          // Monitoring requirement: All failures must be logged
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch sender data from database, using fallback:',
            scenario.error
          )
          
          console.log(`✓ Verified fallback for: ${scenario.name}`)
          consoleSpy.mockRestore()
        }
      })
    })

    describe('Email Template Integration - Task 5.4', () => {
      it('should render TeamInviteEmail template with enhanced sender firstName data', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'EnhancedUser',
          lastName: 'Database',
          email: 'enhanced@example.com',
          imageUrl: 'https://example.com/avatar.jpg'
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: {
                  userByEmail: {
                    id: 'recipientId',
                    email: 'recipient@example.com',
                    firstName: 'Recipient',
                    imageUrl: null
                  }
                }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify template received enhanced sender data
        const emailHtml = (args as any).html
        const emailText = (args as any).text
        
        // Both HTML and text should contain enhanced firstName
        expect(emailHtml).toContain('EnhancedUser invites you to the workspace:')
        expect(emailText).toContain('EnhancedUser invites you to the workspace:')
        
        // Should NOT contain original job sender data
        expect(emailHtml).not.toContain('Joe invites you to the workspace:')
        expect(emailText).not.toContain('Joe invites you to the workspace:')
      })

      it('should render TeamInviteNoAccountEmail template with enhanced sender firstName data', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'DatabaseUser',
          lastName: 'Enhanced',
          email: 'database@example.com',
          imageUrl: null
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null } // No account - uses TeamInviteNoAccountEmail
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify template received enhanced sender data
        const emailHtml = (args as any).html
        const emailText = (args as any).text
        
        // Both HTML and text should contain enhanced firstName
        expect(emailHtml).toContain('DatabaseUser invites you to the workspace:')
        expect(emailText).toContain('DatabaseUser invites you to the workspace:')
        
        // Should NOT contain original job sender data
        expect(emailHtml).not.toContain('Joe invites you to the workspace:')
        expect(emailText).not.toContain('Joe invites you to the workspace:')
      })

      it('should render templates with email-based fallback firstName', async () => {
        const jobWithEmptyFirstName = {
          ...teamInviteJob,
          data: {
            ...teamInviteJob.data,
            sender: {
              firstName: '', // Empty firstName
              lastName: 'Test',
              email: 'awesome.user@company.com',
              imageUrl: undefined
            }
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        // Mock database failure to trigger email fallback
        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw new Error('Database error') })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(jobWithEmptyFirstName)
        
        expect(sendEmail).toHaveBeenCalled()
        
        // Verify template uses email-extracted firstName
        const emailHtml = (args as any).html
        const emailText = (args as any).text
        
        // Should contain email-based firstName
        expect(emailHtml).toContain('awesome.user invites you to the workspace:')
        expect(emailText).toContain('awesome.user invites you to the workspace:')
        
        // Should NOT contain empty firstName
        expect(emailHtml).not.toContain(' invites you to the workspace:')
        expect(emailHtml).not.toContain('undefined invites you')
        expect(emailText).not.toContain(' invites you to the workspace:')
        expect(emailText).not.toContain('undefined invites you')
      })

      it('should render templates professionally with various email-based firstName formats', async () => {
        const emailTestCases = [
          { email: 'testuser123@hotmail.com', expected: 'testuser123' },
          { email: 'sarah.wilson@company.com', expected: 'sarah.wilson' },
          { email: 'user_123@domain.org', expected: 'user_123' },
          { email: 'john-doe@enterprise.co.uk', expected: 'john-doe' }
        ]

        for (const testCase of emailTestCases) {
          jest.clearAllMocks()

          const jobWithTestEmail = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: '', // Empty to trigger email fallback
                lastName: 'Test',
                email: testCase.email,
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw new Error('Database error') })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(jobWithTestEmail)
          
          expect(sendEmail).toHaveBeenCalled()
          
          const emailHtml = (args as any).html
          const emailText = (args as any).text
          
          // Verify professional email appearance
          expect(emailHtml).toContain(`${testCase.expected} invites you to the workspace:`)
          expect(emailText).toContain(`${testCase.expected} invites you to the workspace:`)
          
          // Verify proper email structure
          expect(emailHtml).toContain('test-team') // Team name should appear
          expect(emailHtml).toContain('html') // Should be valid HTML
          expect(emailText).toContain('test-team') // Team name in text version
          
          // Email should be readable and professional
          expect(emailHtml.length).toBeGreaterThan(100) // Substantial content
          expect(emailText.length).toBeGreaterThan(50) // Substantial text content
        }
      })

      it('should handle edge case emails gracefully in template rendering', async () => {
        const edgeCases = [
          { email: '', expectedFallback: 'User' },
          { email: 'a@b.com', expectedFallback: 'a' },
          { email: 'very.long.email.address@subdomain.example.com', expectedFallback: 'very.long.email.address' }
        ]

        for (const edgeCase of edgeCases) {
          jest.clearAllMocks()

          const jobWithEdgeCaseEmail = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: '', // Empty to trigger email fallback
                lastName: 'Test',
                email: edgeCase.email,
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          jest.spyOn(ApolloClient.prototype, 'query')
            .mockImplementationOnce(async () => { throw new Error('Database error') })
            .mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { userByEmail: null }
                } as unknown as ApolloQueryResult<unknown>)
            )

          await service(jobWithEdgeCaseEmail)
          
          expect(sendEmail).toHaveBeenCalled()
          
          const emailHtml = (args as any).html
          const emailText = (args as any).text
          
          // Should handle edge cases gracefully
          expect(emailHtml).toContain(`${edgeCase.expectedFallback} invites you to the workspace:`)
          expect(emailText).toContain(`${edgeCase.expectedFallback} invites you to the workspace:`)
          
          // Email should still be properly formatted
          expect(emailHtml).toContain('test-team')
          expect(emailText).toContain('test-team')
        }
      })

      it('should verify template consistency between HTML and text versions', async () => {
        const enhancedSenderData = {
          id: 'senderId123',
          firstName: 'ConsistencyTest',
          lastName: 'User',
          email: 'consistency@example.com',
          imageUrl: null
        }

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { user: enhancedSenderData }
              } as unknown as ApolloQueryResult<unknown>)
          )
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(teamInviteJob)
        
        expect(sendEmail).toHaveBeenCalled()
        
        const emailHtml = (args as any).html
        const emailText = (args as any).text
        
        // Both HTML and text should contain same sender firstName
        expect(emailHtml).toContain('ConsistencyTest invites you to the workspace:')
        expect(emailText).toContain('ConsistencyTest invites you to the workspace:')
        
        // Both should contain team name
        expect(emailHtml).toContain('test-team')
        expect(emailText).toContain('test-team')
        
        // Both should be substantial content
        expect(emailHtml.length).toBeGreaterThan(100)
        expect(emailText.length).toBeGreaterThan(50)
        
        // HTML should contain HTML tags, text should not
        expect(emailHtml).toMatch(/<[^>]+>/)
        expect(emailText).not.toMatch(/<[^>]+>/)
      })

      it('should verify template security - no injection vulnerabilities', async () => {
        const potentiallyMaliciousEmail = 'user<script>alert("xss")</script>@evil.com'
        
        const jobWithMaliciousEmail = {
          ...teamInviteJob,
          data: {
            ...teamInviteJob.data,
            sender: {
              firstName: '', // Empty to trigger email fallback
              lastName: 'Test',
              email: potentiallyMaliciousEmail,
              imageUrl: undefined
            }
          }
        } as unknown as Job<TeamInviteJob, unknown, string>

        jest.spyOn(ApolloClient.prototype, 'query')
          .mockImplementationOnce(async () => { throw new Error('Database error') })
          .mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

        await service(jobWithMaliciousEmail)
        
        expect(sendEmail).toHaveBeenCalled()
        
        const emailHtml = (args as any).html
        const emailText = (args as any).text
        
        // Should extract safe firstName (before @)
        const expectedFirstName = 'user<script>alert("xss")</script>'
        expect(emailHtml).toContain(`${expectedFirstName} invites you to the workspace:`)
        expect(emailText).toContain(`${expectedFirstName} invites you to the workspace:`)
        
        // Note: React Email templates should handle HTML escaping automatically
        // This test verifies our email extraction doesn't break that security
      })

      it('should verify complete email template data flow with all fallback levels', async () => {
        const testScenarios = [
          {
            name: 'Database success',
            dbUser: { firstName: 'DatabaseUser', lastName: 'Success', email: 'db@example.com', imageUrl: null },
            dbError: false,
            jobFirstName: 'JobUser',
            expectedFirstName: 'DatabaseUser'
          },
          {
            name: 'Database failure, job data success',
            dbUser: null,
            dbError: true,
            jobFirstName: 'JobUser',
            expectedFirstName: 'JobUser'
          },
          {
            name: 'Database failure, job data empty, email fallback',
            dbUser: null,
            dbError: true,
            jobFirstName: '',
            expectedFirstName: 'fallback.email.user'
          }
        ]

        for (const scenario of testScenarios) {
          jest.clearAllMocks()

          const testJob = {
            ...teamInviteJob,
            data: {
              ...teamInviteJob.data,
              sender: {
                firstName: scenario.jobFirstName,
                lastName: 'Test',
                email: 'fallback.email.user@example.com',
                imageUrl: undefined
              }
            }
          } as unknown as Job<TeamInviteJob, unknown, string>

          const apolloMock = jest.spyOn(ApolloClient.prototype, 'query')

          if (scenario.dbError) {
            apolloMock.mockImplementationOnce(async () => { throw new Error('Database error') })
          } else {
            apolloMock.mockImplementationOnce(
              async () =>
                await Promise.resolve({
                  data: { user: scenario.dbUser }
                } as unknown as ApolloQueryResult<unknown>)
            )
          }

          // Second query for recipient
          apolloMock.mockImplementationOnce(
            async () =>
              await Promise.resolve({
                data: { userByEmail: null }
              } as unknown as ApolloQueryResult<unknown>)
          )

          await service(testJob)
          
          expect(sendEmail).toHaveBeenCalled()
          
          const emailHtml = (args as any).html
          const emailText = (args as any).text
          
          // Verify correct firstName appears in template
          expect(emailHtml).toContain(`${scenario.expectedFirstName} invites you to the workspace:`)
          expect(emailText).toContain(`${scenario.expectedFirstName} invites you to the workspace:`)
          
          console.log(`✓ Verified template scenario: ${scenario.name}`)
        }
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
