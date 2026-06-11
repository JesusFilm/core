import { Module } from '@nestjs/common'

import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { prismaServiceProvider } from '../../lib/prisma.service'

import { ActionResolver } from './action.resolver'

@Module({
  imports: [],
  providers: [ActionResolver, DateTimeScalar, prismaServiceProvider],
  exports: []
})
export class ActionModule {}
