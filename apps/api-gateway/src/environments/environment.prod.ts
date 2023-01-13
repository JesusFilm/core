import { EnvironmentConfig } from './types'

export const config: EnvironmentConfig = {
  production: true,
  gatewayConfig: {},
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
      'https://admin-stage.nextstep.is',
      // journeys
      'https://journeys-phi.vercel.app',
      'https://your.nextstep.is',
      'https://your-stage.nextstep.is',
      // watch
      'https://watch-jesusfilm.vercel.app',
      'https://watch-one.vercel.app',
      'https://watch.jesusfilm.org',
      // localhost
      /http:\/\/localhost:*/
    ]
  }
}
