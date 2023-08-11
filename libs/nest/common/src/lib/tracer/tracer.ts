import tracer from 'dd-trace'

// initialized in a different file to avoid hoisting.
tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true
})

tracer.use('http', {
  blocklist: ['/.well-known/apollo/server-health']
})

export default tracer
