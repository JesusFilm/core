import { Module } from '@nestjs/common'

import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'

import { ActionResolver } from './action.resolver'

@Module({
  imports: [],
  providers: [ActionResolver, DateTimeScalar, PrismaService],
  exports: []
})
export class ActionModule {}
