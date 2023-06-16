import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'

@Global()
@Module({
  imports: [],
  providers: [JourneyProfileResolver, PrismaService],
  exports: []
})
export class JourneyProfileModule {}
