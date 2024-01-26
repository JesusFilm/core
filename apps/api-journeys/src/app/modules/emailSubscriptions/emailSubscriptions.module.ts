import { Module } from '@nestjs/common'
import { EmailSubscriptionController } from './emailSubscriptions.controller'

@Module({
  providers: [EmailSubscriptionController]
})
export class EmailSubscriptionModule {}
