import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { LanguageModule } from './modules/language/language.module'
import { TranslationModule } from './modules/translation/translation.module'

@Module({
  imports: [
    LanguageModule,
    TranslationModule,
    GraphQLFederationModule.forRoot({
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
