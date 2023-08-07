import { Module } from '@nestjs/common'

import { NestHealthController } from './nest-health.controller'

@Module({
  controllers: [NestHealthController],
  providers: [],
  exports: []
})
export class NestHealthModule {}
