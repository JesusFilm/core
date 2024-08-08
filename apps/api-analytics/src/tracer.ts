import otlpTracer from '@core/nest/common/otlpTracer'

const { provider, tracer, tracingPlugin, createSpanFn } =
  otlpTracer('api-analytics')

export { provider, tracer, tracingPlugin, createSpanFn }
