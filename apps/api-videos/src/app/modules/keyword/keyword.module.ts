import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { KeywordResolver } from './keyword.resolver'

@Module({
  providers: [KeywordResolver, PrismaService]
})
export class KeywordModule {}
