import { sendEmail } from './email'

const sendEmailMock = jest.fn().mockReturnValue({})
// Mock the SES sendEmail method
jest.mock('@aws-sdk/client-ses', () => ({
  SES: jest.fn().mockImplementation(() => ({
    sendEmail: sendEmailMock
  }))
}))

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: sendEmailMock
  }))
}))

describe('email', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const email = {
    to: 'text@xample.com',
    subject: 'Test Subject',
    text: 'Test Body',
    html: 'Test Html'
  }

  it('should send email using mailerService when SMTP_URL is defined', async () => {
    process.env.SMTP_URL = 'smtp://example.com' // from now on the env var is test

    await sendEmail(email)

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })

  it('should process the email job', async () => {
    const OLD_ENV = process.env
    process.env = {
      ...OLD_ENV,
      SMTP_URL: undefined
    }

    await sendEmail(email)

    expect(sendEmailMock).toHaveBeenCalledWith({
      Source: 'support@nextstep.is',
      Destination: { ToAddresses: [email.to] },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: email.subject
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: email.html
          },
          Text: {
            Charset: 'UTF-8',
            Data: email.text
          }
        }
      }
    })
    process.env = OLD_ENV
  })
})
