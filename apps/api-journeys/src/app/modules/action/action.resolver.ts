import { Resolver } from '@nestjs/graphql';
import { Action } from './action.models';

@Resolver(of => Action)
export class ActionResolver { }
