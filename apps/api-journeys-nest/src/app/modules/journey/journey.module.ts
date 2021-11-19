
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { JourneyController } from './journey.controller';
// import {userProviders} from './user.providers';
import { JourneyService } from './journey.service';
import { JourneyResolvers } from './journey.resolvers';
// import { userProviders } from './user.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyResolvers],
  exports: [JourneyService],
})
export class JourneyModule {
}