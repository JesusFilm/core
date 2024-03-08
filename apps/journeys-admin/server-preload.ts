import { tracer } from 'dd-trace'
import { BaseLogger, LogFn, pino } from 'pino'

/**
 * Set up datadog tracing. This should be called first, so Datadog can hook
 * all the other dependencies like `http`.
 */
function setUpDatadogTracing(): void {
  tracer.init({
    // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
    logInjection: true
  })
}

type LogLevel = keyof Omit<BaseLogger, 'level'>

/**
 * Set up logging. Monkey patches a bunch of stuff.
 */
function setUpLogging(): void {
  // pino is a simple JSON logger with Datadog integration.
  // By default it logs to STDOUT.
  const logger = pino({
    // Your options here.
  })

  function getLoggingFunction(levelName: LogLevel): LogFn {
    const baseLogFn: LogFn = logger[levelName].bind(logger)
    function logFn(...parts): void {
      let data: object | undefined
      let error

      const nativeError = parts.find(
        (it) =>
          (it != null && it instanceof Error) ||
          (it != null &&
            typeof it === 'object' &&
            'name' in it &&
            'message' in it)
      )

      if (nativeError != null) {
        error = cleanObjectForSerialization(nativeError)
        // If you use Sentry, Rollbar, etc, you could capture the error here.
        // ErrorThingy.report(nativeError)
      }

      // If next is trying to log funky stuff, put it into the data object.
      if (parts.length > 1) {
        data = { parts: parts.map(cleanObjectForSerialization) }
      }

      const messages =
        nativeError != null && parts.length === 1
          ? [nativeError.toString()]
          : parts

      baseLogFn({ data, error, type: levelName }, ...messages)
    }

    return logFn
  }

  // Monkey-patch Next.js logger.
  // See https://github.com/atkinchris/next-logger/blob/main/index.js
  // See https://github.com/vercel/next.js/blob/canary/packages/next/build/output/log.ts
  type NextLoggerPrefix =
    | 'wait'
    | 'error'
    | 'warn'
    | 'ready'
    | 'info'
    | 'event'
    | 'trace'

  const cachePath = require.resolve('next/dist/build/output/log')
  const cacheObject = require.cache[cachePath]

  if (cacheObject == null) return

  // This is required to forcibly redefine all properties on the logger.
  // From Next 13 and onwards they're defined as non-configurable, preventing them from being patched.
  cacheObject.exports = { ...cacheObject.exports }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextLogger = require('next/dist/build/output/log')
  Object.keys(nextLogger.prefixes).forEach((key: NextLoggerPrefix) => {
    let fnName: LogLevel

    switch (key) {
      case 'wait':
      case 'ready':
      case 'event':
        fnName = 'info'
        break
      default:
        fnName = key
    }

    Object.defineProperty(cacheObject.exports, key, {
      value: getLoggingFunction(fnName)
    })
  })

  /**
   * Monkey-patch global console.log logger. Yes. Sigh.
   * @type {Array<keyof typeof console>}
   */
  const loggingProperties = ['log', 'debug', 'info', 'warn', 'error'] as const
  for (const key of loggingProperties) {
    let fnName: LogLevel
    switch (key) {
      case 'log':
        fnName = 'info'
        break
      default:
        fnName = key
    }

    console[key] = getLoggingFunction(fnName)
  }

  // Add general error logging.
  process.on('unhandledRejection', (error, promise) => {
    logger.error(
      {
        type: 'unhandledRejection',
        error: cleanObjectForSerialization(error),
        data: { promise: cleanObjectForSerialization(promise) }
      },
      `${(error as Error | undefined)?.toString()}`
    )
  })

  process.on('uncaughtException', (error) => {
    logger.error(
      { type: 'uncaughtException', error: cleanObjectForSerialization(error) },
      `${error.toString()}`
    )
  })
}

function cleanObjectForSerialization(value: unknown): unknown {
  // Clean up or copy `value` so our logger or error reporting system
  // can record it.
  //
  // Because our logger `pino` uses JSON.stringify, we need to do
  // the following here:
  //
  // 1. Remove all cycles. JSON.stringify throws an error when you pass
  //    a value with cyclical references.
  //    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
  // 2. Because JSON.stringify only serializes enumerable properties, we
  //    need to copy interesting, but non-enumerable properties like
  //    value.name and value.message for errors:
  //    JSON.stringify(new Error('nothing serialized')) returns '{}'
  //
  // Implementing this correctly is beyond the scope of my example.
  return value
}

setUpDatadogTracing()
setUpLogging()
