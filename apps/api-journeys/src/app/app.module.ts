import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { LoggerModule } from 'nestjs-pino'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core'
import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { JourneyModule } from './modules/journey/journey.module'
import { EventModule } from './modules/event/event.module'
import { UserJourneyModule } from './modules/userJourney/userJourney.module'
import { UserRoleModule } from './modules/userRole/userRole.module'
import { UserInviteModule } from './modules/userInvite/userInvite.module'
import { VisitorModule } from './modules/visitor/visitor.module'
import { MemberModule } from './modules/member/member.module'
import { TeamModule } from './modules/team/team.module'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    JourneyModule,
    EventModule,
    MemberModule,
    TeamModule,
    UserJourneyModule,
    UserInviteModule,
    UserRoleModule,
    VisitorModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [
        join(process.cwd(), 'apps/api-journeys/src/app/**/*.graphql'),
        join(process.cwd(), 'assets/**/*.graphql')
      ],
      cors: true,
      context: ({ req }) => ({ headers: req.headers }),
      plugins:
        process.env.NODE_ENV !== 'production'
          ? [ApolloServerPluginInlineTraceDisabled]
          : undefined
    }),
    LoggerModule.forRoot({
      pinoHttp: {
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
