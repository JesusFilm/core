import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { EmailSubscriptionController } from './emailSubscriptions.controller'

import { JourneyVisitorService } from '../journeyVisitor/journeyVisitor.service'
import { PrismaService } from '../../lib/prisma.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-subscriptions-email' })],
  providers: [JourneyVisitorService, PrismaService, EmailSubscriptionController]
})
export class EmailSubscriptionModule {}
