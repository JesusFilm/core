import { MailerService } from '@nestjs-modules/mailer'
import { Job } from 'bullmq'

import { EmailConsumer, EmailJob } from './email.consumer'

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

describe('EmailConsumer', () => {
  let emailConsumer: EmailConsumer, mailerService: MailerService

  beforeEach(() => {
    emailConsumer = new EmailConsumer(mailerService)
  })

  it('should process the email job', async () => {
    const job: Job<EmailJob, unknown, string> = {
      name: 'emailJob',
      data: {
        email: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      }
    } as unknown as Job<EmailJob, unknown, string>

    await emailConsumer.process(job)

    expect(sendEmailMock).toHaveBeenCalledWith({
      Source: 'support@nextstep.is',
      Destination: { ToAddresses: [job.data.email] },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: job.data.subject
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: job.data.body
          }
        }
      }
    })
  })
})
