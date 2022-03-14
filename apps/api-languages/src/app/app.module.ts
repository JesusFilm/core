import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { LanguageModule } from './modules/language/language.module'
import { TranslationModule } from './modules/translation/translation.module'

@Module({
  imports: [
    LanguageModule,
    TranslationModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [
        join(process.cwd(), 'apps/api-languages/src/app/**/*.graphql'),
        join(process.cwd(), 'assets/**/*.graphql')
      ],
      cors: true,
      context: ({ req }) => ({ headers: req.headers })
    })
  ]
})
export class AppModule {}
