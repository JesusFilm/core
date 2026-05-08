import nodemailer from 'nodemailer'
import { type Mocked } from 'vitest'

import { sendEmail } from './email'

vi.mock('nodemailer', async () => {
  const originalModule = await vi.importActual<typeof nodemailer>('nodemailer')
  return {
    ...originalModule,
    default: vi.fn()
  }
})

const mockNodeMailer = nodemailer as Mocked<typeof nodemailer>

const sendEmailMock = vi.fn().mockReturnValue({})

describe('email', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV } // make a copy,
    mockNodeMailer.createTransport = vi.fn().mockReturnValue({
      sendMail: sendEmailMock
    })
  })

  afterEach(() => {
    process.env = OLD_ENV
    vi.clearAllMocks()
  })

  const email = {
    to: 'test@gooddomain.com',
    subject: 'Test Subject',
    text: 'Test Body',
    html: 'Test Html'
  }

  it('should send email with default Next Steps support email', async () => {
    process.env.SMTP_URL = 'smtp://example.com'
    process.env.NODE_ENV = 'production'

    await sendEmail(email)
    expect(mockNodeMailer.createTransport).toHaveBeenCalledWith(
      'smtp://example.com',
      { from: '"Next Steps Support" <support@nextstep.is>' }
    )

    expect(sendEmailMock).toHaveBeenCalledWith({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
  })

  it('should send email with custom from', async () => {
    process.env.SMTP_URL = 'smtp://example.com'
    process.env.NODE_ENV = 'production'

    await sendEmail({
      ...email,
      from: '"Jesus Film App" <support@jesusfilmapp.com>'
    })
    expect(mockNodeMailer.createTransport).toHaveBeenCalledWith(
      'smtp://example.com',
      { from: '"Jesus Film App" <support@jesusfilmapp.com>' }
    )

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
