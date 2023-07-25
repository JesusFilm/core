import { Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { ChatButtonResolver } from '../chatButton/chatButton.resolver'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    JourneyResolver,
    BlockService,
    DateTimeScalar,
    ChatButtonResolver,
    PrismaService
  ]
})
export class JourneyModule {}
