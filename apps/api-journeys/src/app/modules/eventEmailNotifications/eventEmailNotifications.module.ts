import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { EventEmailNotificationsResolver } from './eventEmailNotifications.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [EventEmailNotificationsResolver, PrismaService],
  exports: []
})
export class EventEmailNotificationsModule {}
