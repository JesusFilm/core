import tracer from 'dd-trace'

// initialized in a different file to avoid hoisting.
tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true,
  profiling: true,
  runtimeMetrics: true
})
tracer.use('http', {
  blocklist: ['/.well-known/apollo/server-health']
})
tracer.use('graphql')
tracer.use('express')

export default tracer
