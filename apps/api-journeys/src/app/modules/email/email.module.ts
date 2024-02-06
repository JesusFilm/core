import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'

import { EmailService } from '@core/nest/common/emailService'

import { EmailConsumer } from './email.consumer'

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'api-journeys-email' }),
    MailerModule.forRoot({
      transport: process.env.SMTP_URL,
      defaults: {
        from: '"Next Steps Support" <support@nextstep.is>'
      }
    })
  ],
  providers: [EmailConsumer, EmailService],
  exports: []
})
export class EmailModule {}
