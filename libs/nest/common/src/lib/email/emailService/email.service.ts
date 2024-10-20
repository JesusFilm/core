import { SES } from '@aws-sdk/client-ses'
import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name, { timestamp: true })

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
    if (
      to.endsWith('example.com') ||
      to.endsWith('example.org') ||
      to.endsWith('example.net') ||
      to.endsWith('example.edu')
    )
      throw new Error('Example email address')

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html
      })
    } catch (e) {
      this.logger.error(e)
    }
  }
}
