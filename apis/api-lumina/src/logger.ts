import pino from 'pino'

export const logger = pino({
  formatters: {
    level: (label) => ({
      level: label
    })
  }
}).child({ service: 'api-lumina' })
