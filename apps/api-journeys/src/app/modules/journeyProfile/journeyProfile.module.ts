import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [JourneyProfileResolver, PrismaService],
  exports: []
})
export class JourneyProfileModule {}
