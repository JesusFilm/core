import { join } from 'path'

import responseCachePlugin from '@apollo/server-plugin-response-cache'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { LoggerModule } from 'nestjs-pino'

import TranslationModule from '@core/nest/common/TranslationModule'

import { NestHealthModule } from './modules/health/health.module'
import { LanguageModule } from './modules/language/language.module'

@Module({
  imports: [
    LanguageModule,
    NestHealthModule,
    TranslationModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apps/api-languages/src/app/**/*.graphql')
              /* As a language is defined by this API translation.graphql
               * is deliberately not imported:
               * join(
               *   process.cwd(),
               *   'libs/nest/common/src/lib/TranslationModule/translation.graphql'
               * )
               */
            ]
          : [join(process.cwd(), 'assets/**/*.graphql')],
      context: ({ req }) => ({ headers: req.headers }),
      cache: 'bounded',
      plugins: [responseCachePlugin()]
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
