import pino from 'pino'

export const logger = pino({
  formatters: {
    level(level) {
      return { level }
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err
  }
}).child({ service: 'api-journeys-modern' })
