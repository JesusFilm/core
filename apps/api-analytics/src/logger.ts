import pino from 'pino'

export const logger = pino().child({ service: 'api-analytics' })
