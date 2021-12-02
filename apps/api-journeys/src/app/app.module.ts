import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { join } from 'path'
import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { JourneyModule } from './modules/journey/journey.module'
import { ResponseModule } from './modules/response/response.module'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    JourneyModule,
    ResponseModule,
    GraphQLFederationModule.forRoot({
      typePaths: [join(process.cwd(), 'apps/api-journeys/src/app/**/*.graphql')],
      cors: true,
    })
  ]
})
export class AppModule { }
