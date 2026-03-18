import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'

import { JourneyCollectionResolver } from './journeyCollection.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyCollectionResolver, prismaServiceProvider],
  exports: [JourneyCollectionResolver]
})
export class JourneyCollectionModule {}
