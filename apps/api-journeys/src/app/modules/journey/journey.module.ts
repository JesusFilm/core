import { Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { ChatButtonResolver } from '../chatButton/chatButton.resolver'
import { JourneyService } from './journey.service'
import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [],
  providers: [
    JourneyService,
    JourneyResolver,
    BlockService,
    DateTimeScalar,
    ChatButtonResolver,
    PrismaService
  ],
  exports: [JourneyService]
})
export class JourneyModule {}
