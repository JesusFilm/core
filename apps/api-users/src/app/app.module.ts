import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { join } from 'path'
import { UserModule } from './modules/user/user.module'
import { UserJourneyModule } from './modules/userJourney/userJourney.module'


@Module({
  imports: [
    UserModule,
    UserJourneyModule,
    GraphQLFederationModule.forRoot({
      typePaths: [join(process.cwd(), 'apps/api-users/src/app/**/*.graphql')],
      cors: true,      
      context: ({ req }) => ({ headers: req.headers }),      
    }),
  ]  
})
export class AppModule {}
