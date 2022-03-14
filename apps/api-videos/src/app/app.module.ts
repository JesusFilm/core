import { join } from 'path'
import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { VideoModule } from './modules/video/video.module'
import { VideoVariantModule } from './modules/videoVariant/videoVariant.module'

@Module({
  imports: [
    VideoModule,
    VideoVariantModule,
    GraphQLFederationModule.forRoot({
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
