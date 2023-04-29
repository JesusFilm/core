import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileService } from './journeyProfile.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [JourneyProfileService, JourneyProfileResolver, PrismaService],
  exports: [JourneyProfileService]
})
export class JourneyProfileModule {}
