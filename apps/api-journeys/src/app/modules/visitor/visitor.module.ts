import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from './visitor.service'
import { VisitorResolver } from './visitor.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    VisitorService,
    VisitorResolver,
    BlockService,
    PrismaService,
    JourneyService
  ],
  exports: [VisitorService]
})
export class VisitorModule {}
