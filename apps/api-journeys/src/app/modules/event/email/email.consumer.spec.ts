import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/email/emailService'

import { PrismaService } from '../../../lib/prisma.service'

import {
  ApiUsersJob,
  EmailConsumer,
  EventsNotificationJob
} from './email.consumer'

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer
  let emailService: EmailService
  let prismaService: PrismaService

  beforeEach(() => {
    emailService = new EmailService()
    prismaService = new PrismaService()
    emailConsumer = new EmailConsumer(emailService, prismaService)
  })

  describe('process', () => {
    it('should call sendEventsNotification with the correct job', async () => {
      const job: Job<ApiUsersJob> = {
        data: {
          journeyId: 'journeyId',
          visitorId: 'visitorId'
        }
      }

      const sendEventsNotificationSpy = jest.spyOn(
        emailConsumer,
        'sendEventsNotification'
      )

      await emailConsumer.process(job)

      expect(sendEventsNotificationSpy).toHaveBeenCalledWith(job)
    })
  })

  describe('sendEventsNotification', () => {
    it('should send events notification email', async () => {
      const job: Job<EventsNotificationJob> = {
        data: {
          journeyId: 'journeyId',
          visitorId: 'visitorId'
        }
      }

      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail')

      await emailConsumer.sendEventsNotification(job)

      expect(sendEmailSpy).toHaveBeenCalledWith(/* email parameters */)
    })
  })
})
