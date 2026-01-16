const pluginsConfig = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET')
    }
  },
  'mux-video-uploader': {
    enabled: true,
    config: {
      accessTokenId: env('MUX_ACCESS_TOKEN_ID'),
      secretKey: env('MUX_SECRET_KEY'),
      webhookSigningSecret: env('MUX_WEBHOOK_SIGNING_SECRET'),
      playbackSigningId: env('MUX_PLAYBACK_SIGNING_ID'),
      playbackSigningSecret: env('MUX_PLAYBACK_SIGNING_SECRET')
    }
  },
  'strapi-blurhash': {
    enabled: true,
    config: {
      regenerateOnUpdate: true,
      forceRegenerateOnUpdate: false
    }
  }
})

export default pluginsConfig
