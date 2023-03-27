import { join } from 'path'
import { Module } from '@nestjs/common'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { LoggerModule } from 'nestjs-pino'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import TranslationModule from '@core/nest/common/TranslationModule'
import { VideoModule } from './modules/video/video.module'
import { VideoVariantModule } from './modules/videoVariant/videoVariant.module'

@Module({
  imports: [
    TranslationModule,
    VideoModule,
    VideoVariantModule,
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
          : [join(process.cwd(), 'assets/modules/**/*.graphql')],
      cors: true,
      context: ({ req }) => ({ headers: req.headers }),
      cache: 'bounded'
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
