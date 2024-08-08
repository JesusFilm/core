import otlpTracer from '@core/nest/common/otlpTracer'

const { provider, tracer, tracingPlugin, createSpanFn } =
  otlpTracer('api-languages')

export { provider, tracer, tracingPlugin, createSpanFn }
