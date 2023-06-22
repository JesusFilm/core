import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { LoggerModule } from 'nestjs-pino'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { JourneyModule } from './modules/journey/journey.module'
import { EventModule } from './modules/event/event.module'
import { UserJourneyModule } from './modules/userJourney/userJourney.module'
import { JourneyProfileModule } from './modules/journeyProfile/journeyProfile.module'
import { UserRoleModule } from './modules/userRole/userRole.module'
import { UserInviteModule } from './modules/userInvite/userInvite.module'
import { VisitorModule } from './modules/visitor/visitor.module'
import { JourneyVisitorModule } from './modules/journeyVisitor/journeyVisitor.module'
import { HostModule } from './modules/host/host.module'
import { TeamModule } from './modules/team/team.module'
import { UserTeamModule } from './modules/userTeam/userTeam.module'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    EventModule,
    HostModule,
    JourneyModule,
    JourneyVisitorModule,
    JourneyProfileModule,
    TeamModule,
    UserJourneyModule,
    UserInviteModule,
    UserRoleModule,
    UserTeamModule,
    VisitorModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apps/api-journeys/src/app/**/*.graphql'),
              join(
                process.cwd(),
                'libs/nest/common/src/lib/TranslationModule/translation.graphql'
              )
            ]
          : [join(process.cwd(), 'assets/**/*.graphql')],
      cors: true,
      context: ({ req }) => ({ headers: req.headers }),
      cache: 'bounded'
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization'],
        autoLogging: {
          ignore: (req) => req.url === '/.well-known/apollo/server-health'
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  timestampKey: ''
                }
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'trace' : 'info'
      }
    }),
    DatadogTraceModule.forRoot()
  ]
})
export class AppModule {}
