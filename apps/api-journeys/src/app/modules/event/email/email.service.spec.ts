import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'

import { EventsNotificationJob } from './email.consumer'
import { EmailService } from './email.service'

const sendEmailMock = jest.fn().mockReturnValue({})
// Mock the SES sendEmail method
jest.mock('@aws-sdk/client-ses', () => ({
  SES: jest.fn().mockImplementation(() => ({
    sendEmail: sendEmailMock
  }))
}))

describe('EmailService', () => {
  let service: EmailService
  let emailQueue: Queue<EventsNotificationJob>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'api-journeys-events-email',
          useValue: {
            add: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<EmailService>(EmailService)
    emailQueue = module.get<Queue<EventsNotificationJob>>(
      'api-journeys-events-email'
    )
  })

  describe('sendEventsEmail', () => {
    it('should add a job to the email queue', async () => {
      const journeyId = 'journeyId'
      const visitorId = 'visitorId'

      await service.sendEventsEmail(journeyId, visitorId)

      expect(emailQueue.add).toHaveBeenCalledWith('sendEventsEmail', {
        journeyId,
        visitorId
      })
    })
  })
})
