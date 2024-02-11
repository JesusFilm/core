import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import AWS, { SES } from 'aws-sdk'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

AWS.config.update({ region: 'us-east-2' })

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
      await new SES({ region: 'us-east-2' })
        .sendEmail({
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
        .promise()
    }
  }
}
