import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'

import { EmailService } from '@core/nest/common/email/emailService'

import { PrismaService } from '../../lib/prisma.service'

import { EmailConsumer } from './email.consumer'
import { EmailEventsConsumer } from './emailEvents/emailEvents.consumer'
import { SES } from '@aws-sdk/client-ses'

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'api-journeys-email' },
      { name: 'api-journeys-events-email' }
    ),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport:
          process.env.SMTP_URL == null
            ? { SES: new SES({ region: 'us-east-2' }) }
            : process.env.SMTP_URL,
        defaults: {
          from: '"Next Steps Support" <support@nextstep.is>'
        }
      })
    })
  ],
  providers: [EmailConsumer, EmailService, PrismaService, EmailEventsConsumer],
  exports: []
})
export class EmailModule {}
