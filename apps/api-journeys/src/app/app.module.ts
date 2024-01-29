import { join } from 'path'

import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ScheduleModule } from '@nestjs/schedule'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { LoggerModule } from 'nestjs-pino'

import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { EmailModule } from './modules/email/email.module'
import { EmailSubscriptionModule } from './modules/emailSubscriptions/emailSubscriptions.module'
import { EventModule } from './modules/event/event.module'
import { NestHealthModule } from './modules/health/health.module'
import { HostModule } from './modules/host/host.module'
import { JourneyModule } from './modules/journey/journey.module'
import { JourneyProfileModule } from './modules/journeyProfile/journeyProfile.module'
import { JourneyVisitorModule } from './modules/journeyVisitor/journeyVisitor.module'
import { TeamModule } from './modules/team/team.module'
import { UserInviteModule } from './modules/userInvite/userInvite.module'
import { UserJourneyModule } from './modules/userJourney/userJourney.module'
import { UserRoleModule } from './modules/userRole/userRole.module'
import { UserTeamModule } from './modules/userTeam/userTeam.module'
import { UserTeamInviteModule } from './modules/userTeamInvite/userTeamInvite.module'
import { VisitorModule } from './modules/visitor/visitor.module'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    EmailModule,
    EmailSubscriptionModule,
    EventModule,
    HostModule,
    JourneyModule,
    JourneyVisitorModule,
    JourneyProfileModule,
    NestHealthModule,
    TeamModule,
    UserJourneyModule,
    UserInviteModule,
    UserRoleModule,
    UserTeamModule,
    UserTeamInviteModule,
    VisitorModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL ?? 'redis',
        port: 6379
      }
    }),
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
    ScheduleModule.forRoot(),
    DatadogTraceModule.forRoot()
  ]
})
export class AppModule {}
