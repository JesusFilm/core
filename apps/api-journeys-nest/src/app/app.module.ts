import { Module } from '@nestjs/common'
import {GraphQLModule} from '@nestjs/graphql'

import { DatabaseModule } from './modules/database/database.module'
import { JourneyModule } from './modules/journey/journey.module'

@Module({
  imports: [DatabaseModule, JourneyModule, GraphQLModule.forRoot({
    autoSchemaFile: true,
  })],
})
export class AppModule {}
