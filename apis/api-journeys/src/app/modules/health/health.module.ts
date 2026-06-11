import { Module } from '@nestjs/common'

import { prismaServiceProvider } from '../../lib/prisma.service'

import { NestHealthController } from './health.controller'

@Module({
  controllers: [NestHealthController],
  providers: [prismaServiceProvider],
  exports: []
})
export class NestHealthModule {}
