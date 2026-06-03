import tracer from 'dd-trace'

// The deploy version is baked into OTEL_RESOURCE_ATTRIBUTES (e.g.
// "service.version=1.2.3") by the Dockerfile. Parse it out for DD_VERSION.
const otelResourceAttributes = process.env.OTEL_RESOURCE_ATTRIBUTES ?? ''
const serviceVersion = otelResourceAttributes
  .split(',')
  .map((attribute) => attribute.split('='))
  .find(([key]) => key?.trim() === 'service.version')?.[1]
  ?.trim()

// Initialized in its own file and imported first in index.ts so dd-trace patches
// modules before anything requires them. logInjection adds dd.trace_id / dd.span_id
// to the pino logs, letting Datadog link logs to the matching APM trace.
// https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  service: process.env.SERVICE_NAME,
  env: process.env.SERVICE_ENV,
  version: serviceVersion
})

// dd-trace backs the @opentelemetry/api that @core/yoga/tracer and the Pothos
// builder use. Registering its TracerProvider routes those OTel spans through
// dd-trace. The matching @core/yoga/tracer skips its own OTLP provider when this
// flag is set, so tracing stays single-sourced and trace ids correlate with logs.
if (process.env.DD_TRACE_OTEL_ENABLED === 'true') {
  const { TracerProvider } = tracer
  new TracerProvider().register()
}

tracer.use('http', {
  blocklist: ['/.well-known/apollo/server-health']
})

export default tracer
