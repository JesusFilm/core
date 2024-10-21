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
