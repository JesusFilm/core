import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Journey } from '.prisma/api-journeys-client'

import { Journey as JourneyWithUserJourney } from '../../__generated__/graphql'
import { UserJourneyModule } from '../userJourney/userJourney.module'

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
        title: 'Journey Title'
      } as unknown as Journey
      const userId = 'userId'
      const user = {
        userId: 'senderUserId',
        firstName: 'John',
        lastName: 'Smith'
      }
      // Act
      await service.sendJourneyApproveEmail(journey, userId, user)

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'journey-request-approved',
        {
          userId,
          journeyTitle: journey.title,
          sender: user,
          url: '/journeys/journeyId'
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
      } as unknown as JourneyWithUserJourney
      const user = {
        userId: 'senderUserId',
        firstName: 'John',
        lastName: 'Smith'
      }
      // Act
      await service.sendJourneyAccessRequest(journey, user)

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'journey-access-request',
        {
          journey,
          url: '/journeys/journeyId',
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
