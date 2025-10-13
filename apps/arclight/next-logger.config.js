const tracer = require('dd-trace')
const pino = require('pino')

// Initialize tracer first to enable automatic log injection
tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true,
  service: 'arclight',
  env: process.env.NODE_ENV || 'development'
})

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
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
  })

module.exports = {
  logger
}
