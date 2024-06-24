import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { CacheModule } from '@nestjs/cache-manager'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { GrowthSpacesIntegrationResolver } from './growthSpaces/growthSpaces.resolver'
import { GrowthSpacesIntegrationService } from './growthSpaces/growthSpaces.service'
import { IntegrationService } from './integration.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory), CacheModule.register()],
  providers: [
    PrismaService,
    IntegrationService,
    GrowthSpacesIntegrationService,
    GrowthSpacesIntegrationResolver
  ],
  exports: [IntegrationService, GrowthSpacesIntegrationService]
})
export class IntegrationModule {}
