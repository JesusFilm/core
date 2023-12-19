import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'

import { ApiUserEmailJob, UserJourneyService } from './userJourney.service'

describe('UserJourneyService', () => {
  let service: UserJourneyService
  let emailQueue: Queue<ApiUserEmailJob>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        {
          provide: Queue,
          useValue: {
            add: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    emailQueue = module.get<Queue<ApiUserEmailJob>>(Queue)
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
