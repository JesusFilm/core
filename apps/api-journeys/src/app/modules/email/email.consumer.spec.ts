// import { Job } from 'bullmq'

// import { EmailConsumer, EmailJob } from './email.consumer'

// describe('EmailConsumer', () => {
//   let emailConsumer: EmailConsumer

//   beforeEach(() => {
//     emailConsumer = new EmailConsumer()
//   })

//   it('should process the email job', async () => {
//     const job: Job<EmailJob, any, string> = {
//       name: 'emailJob',
//       data: {
//         email: 'test@example.com',
//         subject: 'Test Subject',
//         body: 'Test Body'
//       }
//     } as unknown as Job<EmailJob, any, string>

//     // Mock the SES sendEmail method
//     const sendEmailMock = jest.fn().mockReturnValue({ promise: jest.fn() })
//     jest.mock('aws-sdk', () => ({
//       SES: jest.fn().mockImplementation(() => ({
//         sendEmail: sendEmailMock
//       }))
//     }))

//     await emailConsumer.process(job)

//     expect(sendEmailMock).toHaveBeenCalledWith({
//       Source: 'support@nextstep.is',
//       Destination: { ToAddresses: [job.data.email] },
//       Message: {
//         Subject: {
//           Charset: 'UTF-8',
//           Data: job.data.subject
//         },
//         Body: {
//           Html: {
//             Charset: 'UTF-8',
//             Data: job.data.body
//           }
//         }
//       }
//     })
//   })
// })
