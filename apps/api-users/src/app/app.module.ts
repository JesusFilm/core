import { join } from 'path'
import { Module } from '@nestjs/common'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { LoggerModule } from 'nestjs-pino'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    UserModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
              join(process.cwd(), 'apps/api-users/src/app/**/*.graphql'),
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
