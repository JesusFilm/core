import pino from 'pino'

export const logger = pino({
  formatters: {
    level: (label) => ({ level: label })
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token'
    ],
    remove: true
  }
}).child({ service: 'arclight' })
