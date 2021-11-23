import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { join } from 'path'

import { DatabaseModule } from './modules/database/database.module'
import { JourneyModule } from './modules/journey/journey.module'
import { RadioQuestionModule } from './modules/radio-question/radio-question.module'

@Module({
  imports: [
    DatabaseModule,
    JourneyModule,
    // RadioQuestionModule,
    GraphQLFederationModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'apps/api-journeys/schema.graphql'),
      cors: true
    })
  ]
})
export class AppModule {}
