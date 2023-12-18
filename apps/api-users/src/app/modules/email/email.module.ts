import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { EmailConsumer } from './email.consumer'

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-email' })],
  providers: [EmailConsumer, PrismaService],
  exports: []
})
export class EmailModule {}
