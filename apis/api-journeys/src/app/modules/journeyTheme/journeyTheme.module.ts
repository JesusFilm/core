import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'

import { JourneyThemeResolver } from './journeyTheme.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyThemeResolver, prismaServiceProvider]
})
export class JourneyThemeModule {}
