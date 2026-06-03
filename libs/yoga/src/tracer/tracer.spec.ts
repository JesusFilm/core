const { register, registerInstrumentations } = vi.hoisted(() => ({
  register: vi.fn(),
  registerInstrumentations: vi.fn()
}))

vi.mock('@opentelemetry/api', () => ({
  trace: { getTracer: vi.fn(() => ({})) }
}))
vi.mock('@opentelemetry/exporter-trace-otlp-grpc', () => ({
  OTLPTraceExporter: vi.fn()
}))
vi.mock('@opentelemetry/instrumentation', () => ({ registerInstrumentations }))
vi.mock('@opentelemetry/instrumentation-http', () => ({
  HttpInstrumentation: vi.fn()
}))
vi.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: vi.fn(() => ({}))
}))
vi.mock('@opentelemetry/sdk-trace-base', () => ({ SimpleSpanProcessor: vi.fn() }))
vi.mock('@opentelemetry/sdk-trace-node', () => ({
  NodeTracerProvider: vi.fn(() => ({ register }))
}))
vi.mock('@opentelemetry/semantic-conventions', () => ({
  ATTR_SERVICE_NAME: 'service.name',
  ATTR_SERVICE_VERSION: 'service.version'
}))
vi.mock('@pothos/tracing-opentelemetry', () => ({
  AttributeNames: { OPERATION_NAME: 'operation.name', SOURCE: 'graphql.source' },
  SpanNames: { EXECUTE: 'execute' }
}))
vi.mock('@prisma/instrumentation', () => ({ PrismaInstrumentation: vi.fn() }))

describe('tracer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubEnv('DD_TRACE_OTEL_ENABLED', '')
  })

  it('should register the OTLP provider and instrumentations by default', async () => {
    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(register).toHaveBeenCalledTimes(1)
    expect(registerInstrumentations).toHaveBeenCalledTimes(1)
  })

  it('should skip provider registration and instrumentation when dd-trace owns tracing', async () => {
    vi.stubEnv('DD_TRACE_OTEL_ENABLED', 'true')

    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(register).not.toHaveBeenCalled()
    expect(registerInstrumentations).not.toHaveBeenCalled()
  })
})
