import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'

import { QrCodeResolver } from './qrCode.resolver'
import { QrCodeService } from './qrCode.service'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [QrCodeResolver, QrCodeService, prismaServiceProvider]
})
export class QrCodeModule {}
