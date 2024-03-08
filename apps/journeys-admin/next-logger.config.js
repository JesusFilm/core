const tracer = require('dd-trace')
const pino = require('pino')

tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true
})

module.exports = {
  logger: pino
}
