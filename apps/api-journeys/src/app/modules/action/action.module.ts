import { Module } from '@nestjs/common';
import { ActionResolver } from './action.resolver';
import { ActionService } from './action.service';

@Module({
  providers: [ActionResolver, ActionService]
})
export class ActionModule {}
