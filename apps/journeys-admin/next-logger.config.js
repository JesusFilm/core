const tracer = require('dd-trace')
const pino = require('pino')

tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true,
  // dd-trace v6 flipped this default to true; keep boot output quiet.
  startupLogs: false
})

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    formatters: {
      level: (label, _number) => ({ level: label })
    }
  })

module.exports = {
  logger
}
