import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { JourneyCustomizationFieldResolver } from './journeyCustomizationField.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    JourneyCustomizableService,
    JourneyCustomizationFieldResolver,
    prismaServiceProvider
  ],
  exports: [JourneyCustomizationFieldResolver]
})
export class JourneyCustomizationFieldModule {}
