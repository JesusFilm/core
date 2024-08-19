import { join } from 'path'

import responseCachePlugin from '@apollo/server-plugin-response-cache'
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

import TranslationModule from '@core/nest/common/TranslationModule'

import { AlgoliaModule } from './modules/algolia/algolia.module'
import { BibleBookModule } from './modules/bibleBook/bibleBook.module'
import { BibleCitationModule } from './modules/bibleCitation/bibleCitation.module'
import { BigQueryModule } from './modules/bigQuery/bigQuery.module'
import { NestHealthModule } from './modules/health/health.module'
import { KeywordModule } from './modules/keyword/keyword.module'
import { VideoModule } from './modules/video/video.module'
import { VideoVariantModule } from './modules/videoVariant/videoVariant.module'

@Module({
  imports: [
    NestHealthModule,
    TranslationModule,
    AlgoliaModule,
    BibleBookModule,
    BibleCitationModule,
    BigQueryModule,
    KeywordModule,
    VideoModule,
    VideoVariantModule,
    CacheModule.register(),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apps/api-videos/src/app/**/*.graphql'),
              join(
                process.cwd(),
                'libs/nest/common/src/lib/TranslationModule/translation.graphql'
              )
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
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL ?? 'redis',
        port: 6379
      }
    }),
    DatadogTraceModule.forRoot()
  ]
})
export class AppModule {}
