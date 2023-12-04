import { join } from 'path'

import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { LoggerModule } from 'nestjs-pino'

import { NexusModule } from './modules/nexus/nexus.module'

@Module({
  imports: [
    NexusModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths:
        process.env.NODE_ENV !== 'production'
          ? [
            join(process.cwd(), 'apps/api-nexus/src/app/**/*.graphql'),
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
  ],
})
export class AppModule {}
