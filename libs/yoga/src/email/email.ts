import { SES } from '@aws-sdk/client-ses'
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
  const SMTP_URL = process.env.SMTP_URL ?? null

  if (SMTP_URL != null) {
    try {
      const smtpUrl = (process.env.SMTP_URL as string) ?? 'smtp://maildev:1025'
      const transporter = nodemailer.createTransport(smtpUrl, defaults)
      await transporter.sendMail({
        to,
        subject,
        text,
        html
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    if (
      to.endsWith('example.com') ||
      to.endsWith('example.org') ||
      to.endsWith('example.net') ||
      to.endsWith('example.edu')
    )
      throw new Error('Example email address')

    await new SES({ region: 'us-east-2' }).sendEmail({
      Source: 'support@nextstep.is',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html
          },
          Text: {
            Charset: 'UTF-8',
            Data: text
          }
        }
      }
    })
  }
}
