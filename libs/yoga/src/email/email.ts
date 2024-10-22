import nodemailer from 'nodemailer'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

const defaults = {
  from: '"Next Steps Support" <support@nextstep.is>'
}

export async function sendEmail({
  to,
  subject,
  text,
  html
}: SendEmailParams): Promise<void> {
  if (process.env.SMTP_URL == null) throw new Error('SMTP_URL is not defined')

  const [, domain] = to.split('@')
  const disallowedDomains = [
    'example.com',
    'example.org',
    'example.net',
    'example.edu'
  ]
  if (
    process.env.NODE_ENV === 'production' &&
    disallowedDomains.includes(domain)
  )
    throw new Error('Example email address')

  const transporter = nodemailer.createTransport(process.env.SMTP_URL, defaults)
  await transporter.sendMail({
    to,
    subject,
    text,
    html
  })
}
