import { SES } from '@aws-sdk/client-ses'
import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
    const SMTP_URL = process.env.SMTP_URL ?? null

    if (SMTP_URL != null) {
      try {
        await this.mailerService.sendMail({
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
}
