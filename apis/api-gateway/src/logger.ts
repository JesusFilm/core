import { Logger } from '@graphql-hive/gateway'
import { PinoLogWriter } from '@graphql-hive/logger/dist/writers/pino'
import pino from 'pino'

const pinoLogger = pino({
  formatters: {
    level(level) {
      return { level }
    }
  }
}).child({ service: 'api-gateway' })

const logger = new Logger({
  writers: [new PinoLogWriter(pinoLogger)]
})

export default logger
