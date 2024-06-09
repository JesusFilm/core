import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { BlockService } from '../block/block.service'
import { ChatButtonResolver } from '../chatButton/chatButton.resolver'

import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyResolver, BlockService, DateTimeScalar, ChatButtonResolver]
})
export class JourneyModule {}
