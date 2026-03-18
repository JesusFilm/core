import { Module } from '@nestjs/common'

import { prismaServiceProvider } from '../../lib/prisma.service'

import { JourneysEmailPreferenceResolver } from './journeysEmailPreference.resolver'

@Module({
  imports: [],
  providers: [JourneysEmailPreferenceResolver, prismaServiceProvider],
  exports: []
})
export class JourneysEmailPreferenceModule {}
