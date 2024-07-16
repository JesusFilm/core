import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { WordPressConsumer } from './wordpress.consumer'
import { WordPressQueue } from './wordpress.queue'
import { WordPressService } from './wordpress.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-tags-wordpress' })],
  providers: [
    WordPressConsumer,
    WordPressQueue,
    WordPressService,
    PrismaService
  ]
})
export class WordPressModule {}
