import { join } from 'path'
import { Module } from '@nestjs/common'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig
} from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { VideoModule } from './modules/video/video.module'
import { VideoVariantModule } from './modules/videoVariant/videoVariant.module'
import { TranslationModule } from './modules/translation/translation.module'

@Module({
  imports: [
    TranslationModule,
    VideoModule,
    VideoVariantModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [
        join(process.cwd(), 'apps/api-videos/src/app/**/*.graphql'),
        join(process.cwd(), 'assets/**/*.graphql')
      ],
      cors: true,
      context: ({ req }) => ({ headers: req.headers })
    })
  ]
})
export class AppModule {}
