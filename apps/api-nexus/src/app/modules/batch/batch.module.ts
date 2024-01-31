import { Module } from '@nestjs/common';

import { PrismaService } from '../../lib/prisma.service';

import { BatchResolver } from './batch.resolver';

@Module({
  imports: [],
  providers: [
    BatchResolver,
    PrismaService,
  ],
})
export class BatchModule {}
