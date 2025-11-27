import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { PlausibleResolver } from './plausible.resolver'
import { PlausibleService } from './plausible.service'

@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-plausible' })
  ],
  providers: [PlausibleResolver, PlausibleService, PrismaService]
})
export class PlausibleModule {}
