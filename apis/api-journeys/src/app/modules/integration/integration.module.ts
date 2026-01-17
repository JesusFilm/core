import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { IntegrationGoogleResolver } from './google/google.resolver'
import { IntegrationGrowthSpacesResolver } from './growthSpaces/growthSpaces.resolver'
import { IntegrationGrowthSpacesService } from './growthSpaces/growthSpaces.service'
import { IntegrationResolver } from './integration.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory), CacheModule.register()],
  providers: [
    PrismaService,
    IntegrationResolver,
    IntegrationGrowthSpacesService,
    IntegrationGrowthSpacesResolver,
    IntegrationGoogleResolver
  ],
  exports: [IntegrationGrowthSpacesService]
})
export class IntegrationModule {}
