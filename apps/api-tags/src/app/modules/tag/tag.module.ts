import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { TagResolver } from './tag.resolver'

@Module({
  imports: [],
  providers: [TagResolver, PrismaService],
  exports: []
})
export class TagModule {}
