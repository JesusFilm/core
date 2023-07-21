import { Global, Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { VisitorService } from './visitor.service'
import { VisitorResolver } from './visitor.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [VisitorService, VisitorResolver, BlockService, PrismaService],
  exports: [VisitorService]
})
export class VisitorModule {}
