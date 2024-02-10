import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { EmailPreferencesResolver } from './emailPreferences.resolver'

@Module({
  imports: [],
  providers: [EmailPreferencesResolver, PrismaService],
  exports: []
})
export class EmailPreferencesModule {}
