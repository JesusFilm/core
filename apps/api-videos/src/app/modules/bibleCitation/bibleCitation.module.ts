import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { BibleCitationResolver } from './bibleCitation.resolver'

@Module({
  imports: [],
  providers: [BibleCitationResolver, PrismaService],
  exports: []
})
export class BibleCitationModule {}
