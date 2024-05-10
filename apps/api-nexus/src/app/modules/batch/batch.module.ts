import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { BatchResolver } from './batch.resolver'
import { BatchService } from './batch.service'

@Module({
  imports: [],
  providers: [BatchResolver, BatchService, PrismaService]
})
export class BatchModule {}
