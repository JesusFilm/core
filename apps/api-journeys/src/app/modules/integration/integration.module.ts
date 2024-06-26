import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { CacheModule } from '@nestjs/cache-manager'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { IntegrationGrowthSpacesResolver } from './growthSpaces/growthSpaces.resolver'
import { IntegrationGrowthSpacesService } from './growthSpaces/growthSpaces.service'
import { IntegrationResolver } from './integration.resolver'
import { IntegrationService } from './integration.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory), CacheModule.register()],
  providers: [
    PrismaService,
    IntegrationService,
    IntegrationResolver,
    IntegrationGrowthSpacesService,
    IntegrationGrowthSpacesResolver
  ],
  exports: [IntegrationService, IntegrationGrowthSpacesService]
})
export class IntegrationModule {}
