import { Global, Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { JourneyVisitorService } from './journeyVisitor.service'
import { JourneyVisitorResolver } from './journeyVisitor.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyVisitorService, JourneyVisitorResolver, PrismaService],
  exports: [JourneyVisitorService]
})
export class JourneyVisitorModule {}
