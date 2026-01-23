import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyCustomizationFieldResolver } from './journeyCustomizationField.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyCustomizationFieldResolver, PrismaService],
  exports: [JourneyCustomizationFieldResolver]
})
export class JourneyCustomizationFieldModule {}
