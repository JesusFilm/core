import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from './journey.service'
import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [JourneyService, JourneyResolver, BlockService, DateTimeScalar, PrismaService],
  exports: [JourneyService]
})
export class JourneyModule {}
