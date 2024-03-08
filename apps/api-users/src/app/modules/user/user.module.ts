import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { MailChimpService } from '../mailChimp/mailChimp.service'

import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-users-email' })],
  providers: [UserResolver, PrismaService, MailChimpService, UserService],
  exports: []
})
export class UserModule {}
