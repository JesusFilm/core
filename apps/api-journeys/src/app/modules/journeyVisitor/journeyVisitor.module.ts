import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyVisitorService } from './journeyVisitor.service'
import { JourneyVisitorResolver } from './journeyVisitor.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [JourneyVisitorService, JourneyVisitorResolver, PrismaService],
  exports: [JourneyVisitorService]
})
export class JourneyVisitorModule {}
