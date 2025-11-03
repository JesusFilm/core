import { join } from 'path'

import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { LoggerModule } from 'nestjs-pino'

import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'
import { CustomDomainModule } from './modules/customDomain/customDomain.module'
import { EventModule } from './modules/event/event.module'
import { NestHealthModule } from './modules/health/health.module'
import { HostModule } from './modules/host/host.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { JourneyModule } from './modules/journey/journey.module'
import { JourneyCollectionModule } from './modules/journeyCollection/journeyCollection.module'
import { JourneyCustomizationFieldModule } from './modules/journeyCustomizationField/journeyCustomizationField.module'
import { JourneyEventModule } from './modules/journeyEvent/journeyEvent.module'
import { JourneyNotificationModule } from './modules/journeyNotification/journeyNotification.module'
import { JourneyProfileModule } from './modules/journeyProfile/journeyProfile.module'
import { JourneysEmailPreferenceModule } from './modules/journeysEmailPreference/journeysEmailPreference.module'
import { JourneyThemeModule } from './modules/journeyTheme/journeyTheme.module'
import { JourneyVisitorModule } from './modules/journeyVisitor/journeyVisitor.module'
import { MailChimpModule } from './modules/mailChimp/mailChimp.module'
import { PlausibleModule } from './modules/plausible/plausible.module'
import { QrCodeModule } from './modules/qrCode/qrCode.module'
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
    CustomDomainModule,
    EventModule,
    HostModule,
    IntegrationModule,
    JourneyCollectionModule,
    JourneyCustomizationFieldModule,
    JourneyEventModule,
    JourneysEmailPreferenceModule,
    JourneyModule,
    JourneyThemeModule,
    JourneyVisitorModule,
    JourneyNotificationModule,
    JourneyProfileModule,
    MailChimpModule,
    NestHealthModule,
    PlausibleModule,
    QrCodeModule,
    TeamModule,
    UserJourneyModule,
    UserInviteModule,
    UserRoleModule,
    UserTeamModule,
    UserTeamInviteModule,
    VisitorModule,
    CacheModule.register(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL ?? 'redis',
        port:
          process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379
      }
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apis/api-journeys/src/app/**/*.graphql'),
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
        formatters: {
          level: (label, _number) => ({ level: label })
        },
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
