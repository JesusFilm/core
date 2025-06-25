import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyThemeResolver } from './journeyTheme.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyThemeResolver, PrismaService]
})
export class JourneyThemeModule {}
