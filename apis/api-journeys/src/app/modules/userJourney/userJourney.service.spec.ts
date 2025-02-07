import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { JourneyWithTeamAndUserJourney } from '../../lib/prisma.types'

import { UserJourneyModule } from './userJourney.module'
import { UserJourneyService } from './userJourney.service'

describe('UserJourneyService', () => {
  let service: UserJourneyService
  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [UserJourneyModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserJourneyService>(UserJourneyService)
  })

  describe('sendJourneyApproveEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      // Arrange
      const journey = {
        id: 'journeyId',
        title: 'Journey Title',
        team: {
          title: 'Ukrainian outreach team Odessa'
        },
        primaryImageBlock: {
          id: 'primaryImageBlockId',
          src: undefined
        }
      } as unknown as JourneyWithTeamAndUserJourney
      const userId = 'userId'
      const user = {
        userId: 'senderUserId',
        firstName: 'John',
        lastName: 'Smith',
        email: 'jsmith@example.com'
      }
      // Act
      await service.sendJourneyApproveEmail(journey, userId, user)

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'journey-request-approved',
        {
          userId,
          journey,
          sender: user,
          url: expect.stringContaining('/journeys/journeyId')
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })

  describe('sendJourneyAccessRequest', () => {
    it('should send an email with the correct subject and body', async () => {
      // Arrange
      const journey = {
        id: 'journeyId',
        title: 'Journey Title',
        userJourneys: []
      } as unknown as JourneyWithTeamAndUserJourney
      const user = {
        userId: 'senderUserId',
        firstName: 'John',
        lastName: 'Smith',
        email: 'jsmith@example.com'
      }
      // Act
      await service.sendJourneyAccessRequest(journey, user)

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'journey-access-request',
        {
          journey,
          url: expect.stringContaining('/journeys/journeyId'),
          sender: user
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })
})
