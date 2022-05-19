import { readFileSync } from 'fs'
import { EnvironmentConfig } from './types'

export const config: EnvironmentConfig = {
  production: true,
  gatewayConfig: {
    supergraphSdl: readFileSync('./schema.graphql').toString()
  },
  listenOptions: {
    port: 4000,
    host: '0.0.0.0'
  },
  cors: {
    maxAge: 86400, // 24 hours in seconds
    origin: [
      // apollo studio
      'https://studio.apollographql.com',
      // any project deployed on the jesusfilm vercel account
      /-jesusfilm\.vercel\.app$/,
      // journeys-admin
      'https://journeys-admin.vercel.app',
      'https://admin.nextstep.is',
      // journeys
      'https://journeys-phi.vercel.app',
      'https://your.nextstep.is',
      // watch
      'https://watch-one.vercel.app'
    ]
  }
}
