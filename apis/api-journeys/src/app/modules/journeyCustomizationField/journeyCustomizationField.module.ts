import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyModule } from '../journey/journey.module'

import { JourneyCustomizationFieldResolver } from './journeyCustomizationField.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory), JourneyModule],
  providers: [JourneyCustomizationFieldResolver, PrismaService],
  exports: [JourneyCustomizationFieldResolver]
})
export class JourneyCustomizationFieldModule {}
