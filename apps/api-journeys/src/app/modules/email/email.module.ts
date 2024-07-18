import { MailerModule } from '@nestjs-modules/mailer'
import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { EmailService } from '@core/nest/common/email/emailService'

import { PrismaService } from '../../lib/prisma.service'

import { EmailConsumer } from './email.consumer'
import { EmailEventsConsumer } from './emailEvents/emailEvents.consumer'

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'api-journeys-email' },
      { name: 'api-journeys-events-email' }
    ),
    MailerModule.forRoot({
      transport: process.env.SMTP_URL ?? 'smtp://maildev:1025',
      defaults: {
        from: '"Next Steps Support" <support@nextstep.is>'
      }
    })
  ],
  providers: [EmailConsumer, EmailService, PrismaService, EmailEventsConsumer],
  exports: []
})
export class EmailModule {}
