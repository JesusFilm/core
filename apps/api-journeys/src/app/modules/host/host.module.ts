import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'
import { HostResolver } from './host.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [HostResolver, PrismaService, JourneyService],
  exports: [HostResolver]
})
export class HostModule {}
