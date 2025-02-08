import pino from 'pino'

export const logger = pino({
  formatters: {
    level(level) {
      return { level }
    }
  }
}).child({ service: 'api-users' })
