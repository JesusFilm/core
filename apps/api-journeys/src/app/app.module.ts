import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { JourneyModule } from './modules/journey/journey.module'
import { ResponseModule } from './modules/response/response.module'
import { EventModule } from './modules/event/event.module'
import { UserJourneyModule } from './modules/userJourney/userJourney.module'
// import { UserJourneyService } from './modules/userJourney/userJourney.service'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    JourneyModule,
    ResponseModule,
    EventModule,
    UserJourneyModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [
        join(process.cwd(), 'apps/api-journeys/src/app/**/*.graphql'),
        join(process.cwd(), 'assets/**/*.graphql')
      ],
      cors: true,
      context: ({ req }) => ({ headers: req.headers })
    })
  ]
})
export class AppModule {}
