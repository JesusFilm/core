import { Module } from '@nestjs/common'

import { GraphQLGatewayModule } from '@nestjs/graphql'
// import { RemoteGraphQLDataSource } from '@apollo/gateway'
// import * as admin from 'firebase-admin'

// if (
//   process.env.GOOGLE_APPLICATION_JSON != null &&
//   process.env.GOOGLE_APPLICATION_JSON !== ''
// ) {
//   admin.initializeApp({
//     credential: admin.credential.cert(
//       JSON.parse(process.env.GOOGLE_APPLICATION_JSON)
//     )
//   })
// }

// class AuthenticatedDataSource extends RemoteGraphQLDataSource {
//   willSendRequest({ request, context }): void {
//     // Pass the user's id from the context to each subgraph
//     // as a header called `user-id`
//     if (context.userId != null) {
//       request.http.headers.set('user-id', context.userId)
//     }
//   }
// }

@Module({
  imports: [GraphQLGatewayModule.forRootAsync({
    useFactory: async () => ({      
      gateway: {
        serviceList: [
          { name: 'journeys', url: 'http://localhost:4001/graphql' }
        ]
      },
      server: {
        cors: true,
        // context: async ({ req }) => {
        //   const token = req.headers.authorization
        //   if (
        //     process.env.GOOGLE_APPLICATION_JSON == null ||
        //     process.env.GOOGLE_APPLICATION_JSON === '' ||
        //     token == null
        //   )
        //     return {}
        //   try {
        //     const { uid } = await admin.auth().verifyIdToken(token)
        //     return { userId: uid }
        //   } catch (err) {
        //     console.log(err)
        //     return {}
        //   }
        // },
        // buildService({ url }) {
        //   return new AuthenticatedDataSource({ url })
        // }
      },
    })
  })],
})
export class AppModule {}
