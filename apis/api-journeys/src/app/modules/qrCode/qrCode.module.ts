import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { QrCodeResolver } from './qrCode.resolver'
import { QrCodeService } from './qrCode.service'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [QrCodeResolver, QrCodeService, PrismaService]
})
export class QrCodeModule {}
