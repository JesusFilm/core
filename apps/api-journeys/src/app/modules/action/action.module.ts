import { Module } from '@nestjs/common';
import { ActionResolver } from './action.resolver';

@Module({
  providers: [ActionResolver]
})
export class ActionModule { }
