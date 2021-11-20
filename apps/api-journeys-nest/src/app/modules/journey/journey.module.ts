import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { JourneyService } from './journey.service';
import { JourneyResolvers } from './journey.resolvers';

@Module({
  imports: [DatabaseModule],
  providers: [JourneyService, JourneyResolvers],
  exports: [JourneyService],
})
export class JourneyModule {
}