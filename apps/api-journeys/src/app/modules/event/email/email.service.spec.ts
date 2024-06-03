import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { EmailService } from './email.service'

describe('EmailService', () => {
  let emailService: EmailService

  const journeyId = 'journey-id'
  const visitorId = 'visitor-id'

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn(),
      getJob: jest.fn(),
      remove: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'BullQueue_api-journeys-events-email',
          useValue: emailQueue
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-event-email'))
      .useValue(emailQueue)
      .compile()

    emailService = module.get<EmailService>(EmailService)
  })

  it('should send events email', async () => {
    await emailService.sendEventsEmail(journeyId, visitorId)
    expect(emailQueue.add).toHaveBeenCalledWith(
      'visitor-event',
      {
        journeyId,
        visitorId
      },
      {
        delay: 120000,
        jobId: 'visitor-event-journey-id-visitor-id',
        removeOnComplete: true,
        removeOnFail: { age: 864000 }
      }
    )
  })

  it('should remove the job if it exists and send events email', async () => {
    emailQueue.getJob.mockResolvedValueOnce({})
    await emailService.sendEventsEmail(journeyId, visitorId)
    expect(emailQueue.remove).toHaveBeenCalled()
    expect(emailQueue.add).toHaveBeenCalledWith(
      'visitor-event',
      {
        journeyId,
        visitorId
      },
      {
        delay: 120000,
        jobId: 'visitor-event-journey-id-visitor-id',
        removeOnComplete: true,
        removeOnFail: { age: 864000 }
      }
    )
  })

  it('should remove the job if it exists and video event is start', async () => {
    emailQueue.getJob.mockResolvedValueOnce({})
    await emailService.sendEventsEmail(journeyId, visitorId, 'start')
    expect(emailQueue.remove).toHaveBeenCalled()
    expect(emailQueue.add).not.toHaveBeenCalled()
  })

  it('should remove the job if it exists and video event is play', async () => {
    emailQueue.getJob.mockResolvedValueOnce({})
    await emailService.sendEventsEmail(journeyId, visitorId, 'play')
    expect(emailQueue.remove).toHaveBeenCalled()
    expect(emailQueue.add).not.toHaveBeenCalled()
  })
})
