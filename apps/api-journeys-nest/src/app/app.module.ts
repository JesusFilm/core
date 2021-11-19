import { Module } from '@nestjs/common'
import {GraphQLModule} from '@nestjs/graphql'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './modules/database/database.module'
import { JourneyModule } from './modules/journey/journey.module'

@Module({
  imports: [DatabaseModule, JourneyModule, GraphQLModule.forRoot({
    autoSchemaFile: true,
  })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
