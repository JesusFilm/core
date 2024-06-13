import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { JourneysEmailPreferenceResolver } from './journeysEmailPreference.resolver'

@Module({
  imports: [],
  providers: [JourneysEmailPreferenceResolver, PrismaService],
  exports: []
})
export class JourneysEmailPreferenceModule {}
