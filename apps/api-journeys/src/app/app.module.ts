import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { join } from 'path'
import { ActionModule } from './modules/action/action.module'
import { BlockModule } from './modules/block/block.module'

import { JourneyModule } from './modules/journey/journey.module'
// import { RadioQuestionModule } from './modules/radio-question/radio-question.module'
// import { ResponseModule } from './modules/response/response.module'
// import { SignUpModule } from './modules/signup/signup.module'
import { VideoModule } from './modules/block/video/video.module'

@Module({
  imports: [
    ActionModule,
    BlockModule,
    JourneyModule,
    // ResponseModule,
    // RadioQuestionModule,
    // SignUpModule,
    VideoModule,
    GraphQLFederationModule.forRoot({
      // autoSchemaFile: join(process.cwd(), 'apps/api-journeys/schema.graphql'),
      // buildSchemaOptions: {
      //   orphanedTypes: [Journey],
      // },
      typePaths: [join(process.cwd(), 'apps/api-journeys/src/app/**/*.graphql')],
      cors: true,
    })
  ]
})
export class AppModule { }
