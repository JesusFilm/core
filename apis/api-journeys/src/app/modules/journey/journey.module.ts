import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { ChatButtonResolver } from '../chatButton/chatButton.resolver'
import { QrCodeService } from '../qrCode/qrCode.service'

import { JourneyResolver } from './journey.resolver'
import { JourneyCustomizableService } from './journeyCustomizable.service'

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
    JourneyCustomizableService,
    BlockService,
    DateTimeScalar,
    ChatButtonResolver,
    PrismaService,
    QrCodeService
  ]
})
export class JourneyModule {}
