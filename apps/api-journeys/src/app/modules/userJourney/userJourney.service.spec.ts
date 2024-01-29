import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Journey } from '.prisma/api-journeys-client'

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
      .overrideProvider(getQueueToken('api-users-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserJourneyService>(UserJourneyService)
  })

  describe('sendEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      // Arrange
      const journey = {
        id: 'journeyId',
        title: 'Journey Title'
      } as unknown as Journey
      const userId = 'userId'
      const expectedSubject = `Access to edit journey: ${journey.title}`
      const expectedBody = `<html><body>You have been granted access to edit the journey: ${
        journey.title
      }. You can find the journey at: <a href="${
        process.env.JOURNEYS_ADMIN_URL ?? ''
      }/journeys/${journey.id}">${
        process.env.JOURNEYS_ADMIN_URL ?? ''
      }/journeys/${journey.id}</a>.</body></html>`

      // Act
      await service.sendEmail(journey, userId)

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'email',
        {
          userId,
          subject: expectedSubject,
          text: 'You have been granted access to edit the journey: Journey Title. You can find the journey at: /journeys/journeyId',
          body: expectedBody
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
