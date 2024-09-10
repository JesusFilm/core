import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { NestHealthController } from './health.controller'

@Module({
  controllers: [NestHealthController],
  providers: [PrismaService],
  exports: []
})
export class NestHealthModule {}
