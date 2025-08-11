import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyCustomizationFieldResolver } from './journeyCustomizationField.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyCustomizationFieldResolver, PrismaService],
  exports: [JourneyCustomizationFieldResolver]
})
export class JourneyCustomizationFieldModule {}
