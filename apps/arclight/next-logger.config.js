const tracer = require('dd-trace')
const pino = require('pino')

tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true,
  env: process.env.NODE_ENV || 'development'
})

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    formatters: {
      level: (label) => ({ level: label }),
      log: (object) => {
        const span = tracer.scope().active()
        if (span) {
          object.dd = {
            trace_id: span.context().toTraceId(),
            span_id: span.context().toSpanId()
          }
        }
        return object
      }
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
  })

module.exports = {
  logger
}
