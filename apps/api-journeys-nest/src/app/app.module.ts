import { Module } from '@nestjs/common'
import {GraphQLModule} from '@nestjs/graphql'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './modules/database/database.module'

@Module({
  imports: [DatabaseModule, GraphQLModule.forRoot({
    typePaths: ['./**/*.graphql']
  })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
