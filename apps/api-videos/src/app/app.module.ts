import { join } from 'path'

import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { LoggerModule } from 'nestjs-pino'

import TranslationModule from '@core/nest/common/TranslationModule'
import { NestHealthModule } from '@core/nest/health'

import { VideoModule } from './modules/video/video.module'
import { VideoVariantModule } from './modules/videoVariant/videoVariant.module'

@Module({
  imports: [
    NestHealthModule,
    TranslationModule,
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
