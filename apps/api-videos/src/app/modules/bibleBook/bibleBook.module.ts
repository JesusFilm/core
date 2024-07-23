import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { BibleBookResolver } from './bibleBook.resolver'

@Module({
  imports: [],
  providers: [BibleBookResolver, PrismaService],
  exports: []
})
export class BibleBookModule {}
