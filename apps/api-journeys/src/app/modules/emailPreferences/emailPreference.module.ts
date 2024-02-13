import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { EmailPreferenceResolver } from './emailPreference.resolver'

@Module({
  imports: [],
  providers: [EmailPreferenceResolver, PrismaService],
  exports: []
})
export class EmailPreferencesModule {}
