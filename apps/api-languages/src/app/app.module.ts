import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { LoggerModule } from 'nestjs-pino'
import { DatadogTraceModule } from 'nestjs-ddtrace'
import TranslationModule from '@core/nest/common/TranslationModule'
import { LanguageModule } from './modules/language/language.module'
import { CountryModule } from './modules/country/country.module'

@Module({
  imports: [
    CountryModule,
    LanguageModule,
    TranslationModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [
        join(process.cwd(), 'apps/api-languages/src/app/**/*.graphql'),
        join(process.cwd(), 'assets/**/*.graphql'),
        join(
          process.cwd(),
          'libs/nest/common/src/lib/TranslationModule/translation.graphql'
        )
      ],
      cors: true,
      context: ({ req }) => ({ headers: req.headers })
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
