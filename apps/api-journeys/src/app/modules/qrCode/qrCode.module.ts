import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { QrCodeResolver } from './qrCode.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [QrCodeResolver, PrismaService]
})
export class QrCodeModule {}
