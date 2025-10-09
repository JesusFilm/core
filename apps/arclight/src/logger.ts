import tracer from 'dd-trace'
import pino from 'pino'

export const logger = pino({
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
}).child({ service: 'arclight' })
