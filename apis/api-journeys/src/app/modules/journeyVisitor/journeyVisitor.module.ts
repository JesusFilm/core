import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyVisitorResolver } from './journeyVisitor.resolver'
import { JourneyVisitorService } from './journeyVisitor.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyVisitorService, JourneyVisitorResolver, PrismaService],
  exports: [JourneyVisitorService]
})
export class JourneyVisitorModule {}
