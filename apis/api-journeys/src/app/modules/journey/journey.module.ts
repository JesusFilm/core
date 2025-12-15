import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { ChatButtonResolver } from '../chatButton/chatButton.resolver'
import { PlausibleService } from '../plausible/plausible.service'
import { QrCodeService } from '../qrCode/qrCode.service'

import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue(
      { name: 'api-journeys-plausible' },
      { name: 'api-journeys-revalidate' }
    )
  ],
  providers: [
    JourneyResolver,
    BlockService,
    DateTimeScalar,
    ChatButtonResolver,
    PrismaService,
    PlausibleService,
    QrCodeService
  ]
})
export class JourneyModule {}
