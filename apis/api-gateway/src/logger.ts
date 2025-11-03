import { defineConfig } from '@graphql-hive/gateway'
import pino, { Logger as PinoLogger } from 'pino'

const pinoLogger = pino({
  formatters: {
    level(level) {
      return { level }
    }
  }
}).child({ service: 'api-gateway' })

type Logger = Extract<
  Parameters<typeof defineConfig>[0]['logging'],
  { name?: string }
>

function createLogger(pinoLogger: PinoLogger): Logger {
  return {
    log(...args: unknown[]) {
      // @ts-expect-error as graphql-hive logger types are not as strong as pino
      pinoLogger.info(...args)
    },

    warn(...args: unknown[]) {
      // @ts-expect-error as graphql-hive logger types are not as strong as pino
      pinoLogger.warn(...args)
    },

    info(...args: unknown[]) {
      // @ts-expect-error as graphql-hive logger types are not as strong as pino
      pinoLogger.info(...args)
    },

    error(...args: unknown[]) {
      // @ts-expect-error as graphql-hive logger types are not as strong as pino
      pinoLogger.error(...args)
    },

    debug(...args: unknown[]) {
      // @ts-expect-error as graphql-hive logger types are not as strong as pino
      pinoLogger.debug(...args)
    },

    child(name: string | Record<string, string | number>) {
      if (typeof name === 'string') {
        return createLogger(pinoLogger.child({ name }))
      } else {
        return createLogger(pinoLogger.child(name))
      }
    }
  }
}

export default createLogger(pinoLogger)
