import { Module } from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { ComplexityPlugin } from '../../plugins/complexity.plugin';
import { DatabaseModule } from '../database/database.module';
import { JourneyService } from '../journey/journey.service';
import { ActionResolver, NavigateToJourneyActionResolver } from './action.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ActionResolver, JourneyService]
})
export class ActionModule { }
