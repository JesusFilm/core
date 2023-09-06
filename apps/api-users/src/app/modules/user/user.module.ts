import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { UserResolver } from './user.resolver'

@Module({
  imports: [],
  providers: [UserResolver, PrismaService],
  exports: []
})
export class UserModule {}
