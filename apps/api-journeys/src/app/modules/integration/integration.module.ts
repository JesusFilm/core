import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { CacheModule } from '@nestjs/cache-manager'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { IntegrationGrowthSpacesResolver } from './growthSpaces/growthSpaces.resolver'
import { IntegrationGrothSpacesService } from './growthSpaces/growthSpaces.service'
import { IntegrationResolver } from './integration.resolver'
import { IntegrationService } from './integration.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory), CacheModule.register()],
  providers: [
    PrismaService,
    IntegrationService,
    IntegrationResolver,
    IntegrationGrothSpacesService,
    IntegrationGrowthSpacesResolver
  ],
  exports: [IntegrationService, IntegrationGrothSpacesService]
})
export class IntegrationModule {}
