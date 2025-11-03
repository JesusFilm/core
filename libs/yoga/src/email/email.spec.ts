import { sendEmail } from './email'

const sendEmailMock = jest.fn().mockReturnValue({})

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: sendEmailMock
  }))
}))

describe('email', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV } // make a copy
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
  })

  const email = {
    to: 'test@gooddomain.com',
    subject: 'Test Subject',
    text: 'Test Body',
    html: 'Test Html'
  }

  it('should send email', async () => {
    process.env.SMTP_URL = 'smtp://example.com'
    process.env.NODE_ENV = 'production'

    await sendEmail(email)

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })

  it('should throw error with example email address', async () => {
    process.env.SMTP_URL = 'smtp://example.com'
    process.env.NODE_ENV = 'production'
    await expect(
      sendEmail({ ...email, to: 'test@example.com' })
    ).rejects.toThrow('Example email address')
  })

  it('should throw error without SMTP URL', async () => {
    await expect(sendEmail(email)).rejects.toThrow('SMTP_URL is not defined')
  })
})
