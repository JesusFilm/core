import { join } from 'path'

import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { LoggerModule } from 'nestjs-pino'

import { CloudflareImageModule } from './modules/cloudflare/image/image.module'
import { CloudflareVideoModule } from './modules/cloudflare/video/video.module'
import { NestHealthModule } from './modules/health/health.module'
import { SegmindModule } from './modules/segmind/segmind.module'
import { UnsplashImageModule } from './modules/unsplash/image/image.module'

@Module({
  imports: [
    CloudflareImageModule,
    CloudflareVideoModule,
    SegmindModule,
    NestHealthModule,
    UnsplashImageModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apps/api-media/src/app/**/*.graphql'),
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
    DatadogTraceModule.forRoot()
  ]
})
export class AppModule {}
