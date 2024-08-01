import { Module } from '@nestjs/common'
import { KeywordResolver } from './keyword.resolver'
import { PrismaService } from '../../lib/prisma.service'

@Module({
  providers: [KeywordResolver, PrismaService]
})
export class KeywordModule {}
