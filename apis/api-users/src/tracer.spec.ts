const { init, use, register, TracerProvider } = vi.hoisted(() => {
  const registerMock = vi.fn()
  return {
    init: vi.fn(),
    use: vi.fn(),
    register: registerMock,
    TracerProvider: vi.fn(() => ({ register: registerMock }))
  }
})

vi.mock('dd-trace', () => ({
  default: { init, use, TracerProvider }
}))

describe('tracer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubEnv('DD_TRACE_OTEL_ENABLED', '')
    vi.stubEnv('SERVICE_NAME', '')
    vi.stubEnv('SERVICE_ENV', '')
    vi.stubEnv('OTEL_RESOURCE_ATTRIBUTES', '')
  })

  it('should initialize dd-trace with log injection and runtime metrics', async () => {
    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ logInjection: true, runtimeMetrics: true })
    )
  })

  it('should pass service, env and parsed version to dd-trace', async () => {
    vi.stubEnv('SERVICE_NAME', 'api-users')
    vi.stubEnv('SERVICE_ENV', 'stage')
    vi.stubEnv('OTEL_RESOURCE_ATTRIBUTES', 'service.version=1.2.3,foo=bar')

    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'api-users',
        env: 'stage',
        version: '1.2.3'
      })
    )
  })

  it('should register the OpenTelemetry TracerProvider when DD_TRACE_OTEL_ENABLED is true', async () => {
    vi.stubEnv('DD_TRACE_OTEL_ENABLED', 'true')

    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(TracerProvider).toHaveBeenCalledTimes(1)
    expect(register).toHaveBeenCalledTimes(1)
  })

  it('should not register the OpenTelemetry TracerProvider when DD_TRACE_OTEL_ENABLED is unset', async () => {
    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(TracerProvider).not.toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
  })

  it('should exclude the health check path from http tracing', async () => {
    await import(/* webpackChunkName: "tracer" */ './tracer')

    expect(use).toHaveBeenCalledWith('http', {
      blocklist: ['/.well-known/apollo/server-health']
    })
  })
})
