import { Module } from '@nestjs/common'

import { ChatOpenEventResolver } from './button/button.resolver'
import { EventResolver } from './event.resolver'

@Module({
  providers: [ChatOpenEventResolver, EventResolver]
})
export class EventModule {}
